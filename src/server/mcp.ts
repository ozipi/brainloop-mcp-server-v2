/**
 * @file MCP protocol handler with session management
 * @module server/mcp
 *
 * @remarks
 * This implementation handles multiple concurrent sessions per MCP SDK design:
 * - One Server instance per session
 * - Each Server has its own StreamableHTTPServerTransport
 * - Session isolation and management
 */

import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CreateMessageRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { serverConfig, serverCapabilities } from "../constants/server/server-config.js";
import { sendSamplingRequest } from "../handlers/sampling.js";
import { handleListTools, handleToolCall } from "../handlers/tool-handlers.js";
import { handleListPrompts, handleGetPrompt } from "../handlers/prompt-handlers.js";
import { handleListResources, handleResourceCall } from "../handlers/resource-handlers.js";
import { logger } from "../utils/logger.js";
import { rateLimitMiddleware, validateProtocolVersion, requestSizeLimit } from "./middleware.js";
import type { RedditAuthInfo } from "../types/request-context.js";
import type { AuthenticatedRequest, OAuthProvider } from "./oauth.js";

// Per-session auth context storage
interface SessionAuth {
  accessToken: string;
  refreshToken: string;
  username: string;
}

interface SessionInfo {
  server: Server;
  transport: StreamableHTTPServerTransport;
  auth?: SessionAuth;
  createdAt: Date;
  lastAccessed: Date;
}

// Interface for MCP Handler
export interface IMCPHandler {
  setupRoutes(app: express.Application, authMiddleware: express.RequestHandler): Promise<void>;
  getServerForSession(sessionId: string): Server | undefined;
  getAllServers(): Server[];
  getServer(): Server;
  cleanupSession(sessionId: string): void;
  getActiveSessionCount(): number;
  shutdown(): void;
}

/**
 * MCP Handler with per-session server instances
 */
export class MCPHandler implements IMCPHandler {
  private sessions = new Map<string, SessionInfo>();
  private oauthProvider?: OAuthProvider;

  // Session cleanup interval (clear sessions older than 1 hour)
  private cleanupInterval: NodeJS.Timeout;
  private readonly SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

  constructor(oauthProvider?: OAuthProvider) {
    this.oauthProvider = oauthProvider;
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupOldSessions();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Creates a new server instance with handlers
   */
  private createServer(sessionId: string, sessionAuth?: SessionAuth): Server {
    // Create new server instance for this session
    const server = new Server(serverConfig, serverCapabilities);

    // Tools
    server.setRequestHandler(ListToolsRequestSchema, (request) => {
      logger.debug(`📋 [${sessionId}] Listing tools`);
      return handleListTools(request);
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      logger.info(`🔧 [TOOL REQUEST] ${request.params.name}`, {
        sessionId,
        args: JSON.stringify(request.params.arguments).substring(0, 200),
        hasAuth: !!sessionAuth
      });

      if (!sessionAuth) {
        logger.error(`❌ [AUTH ERROR] No session auth for tool call`, { sessionId, tool: request.params.name });
        throw new Error("Authentication required for tool calls");
      }

      const authInfo: RedditAuthInfo = {
        token: sessionAuth.accessToken,
        clientId: "mcp-client",
        scopes: ["read"],
        extra: {
          userId: sessionAuth.username,
          redditAccessToken: sessionAuth.accessToken,
          redditRefreshToken: sessionAuth.refreshToken,
        },
      };

      // Create token refresh callback if OAuth provider is available
      const refreshTokenCallback = this.oauthProvider && sessionAuth.refreshToken
        ? async () => {
            try {
              logger.info(`Refreshing Google access token for session ${sessionId}`);
              const newTokens = await this.oauthProvider!.refreshGoogleAccessToken(sessionAuth.refreshToken);

              // Update session with new tokens
              sessionAuth.accessToken = newTokens.accessToken;
              sessionAuth.refreshToken = newTokens.refreshToken;

              // Update session info
              const session = this.sessions.get(sessionId);
              if (session) {
                session.auth = sessionAuth;
              }

              logger.info(`Successfully refreshed token for session ${sessionId}`);
              return newTokens.accessToken;
            } catch (error) {
              logger.error(`Failed to refresh token for session ${sessionId}`, {
                error: error instanceof Error ? error.message : String(error),
              });
              throw error;
            }
          }
        : undefined;

      try {
        const result = await handleToolCall(request, { sessionId, authInfo, refreshTokenCallback });
        logger.info(`✅ [TOOL RESPONSE] ${request.params.name}`, {
          sessionId,
          hasContent: !!result?.content,
          contentBlocks: result?.content?.length || 0
        });
        return result;
      } catch (error) {
        logger.error(`❌ [TOOL ERROR] ${request.params.name}`, {
          sessionId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    });

    // Prompts
    server.setRequestHandler(ListPromptsRequestSchema, () => {
      logger.debug(`📋 [${sessionId}] Listing prompts`);
      return handleListPrompts();
    });

    server.setRequestHandler(GetPromptRequestSchema, (request) => {
      logger.debug(`📝 [${sessionId}] Getting prompt: ${request.params.name}`);
      return handleGetPrompt(request);
    });

    // Resources
    server.setRequestHandler(ListResourcesRequestSchema, () => {
      logger.debug(`📋 [${sessionId}] Listing resources`);
      return handleListResources();
    });

    server.setRequestHandler(ReadResourceRequestSchema, (request) => {
      logger.debug(`📖 [${sessionId}] Reading resource: ${request.params.uri}`);

      const authInfo = sessionAuth
        ? {
            token: sessionAuth.accessToken,
            clientId: "mcp-client",
            scopes: ["read"],
            extra: {
              userId: sessionAuth.username,
              redditAccessToken: sessionAuth.accessToken,
              redditRefreshToken: sessionAuth.refreshToken,
            },
          }
        : undefined;

      return handleResourceCall(request, authInfo ? { authInfo } : undefined);
    });

    // Sampling
    server.setRequestHandler(CreateMessageRequestSchema, (request) => {
      return sendSamplingRequest(request, { sessionId });
    });

    return server;
  }

  /**
   * Sets up routes for the Express app
   */
  async setupRoutes(
    app: express.Application,
    authMiddleware: express.RequestHandler,
  ): Promise<void> {
    // Apply middleware stack
    const mcpMiddleware = [
      authMiddleware,
      rateLimitMiddleware(60000, 100), // 100 requests per minute
      validateProtocolVersion,
      requestSizeLimit(10 * 1024 * 1024), // 10MB max
    ];

    // MCP endpoint with full middleware stack
    app.all("/", ...mcpMiddleware, (req, res) =>
      this.handleRequest(req as AuthenticatedRequest, res),
    );

    // Backup MCP endpoint
    app.all("/mcp", ...mcpMiddleware, (req, res) =>
      this.handleRequest(req as AuthenticatedRequest, res),
    );
  }

  /**
   * Handles incoming MCP requests with proper session management following MCP spec
   */
  private async handleRequest(req: AuthenticatedRequest, res: express.Response): Promise<void> {
    const startTime = Date.now();

    console.log("📡 [MCP] Request received", {
      method: req.method,
      url: req.url,
      hasAuth: !!req.auth,
      userId: req.auth?.extra?.userId,
      headers: {
        'mcp-session-id': req.headers['mcp-session-id'],
        'x-session-id': req.headers['x-session-id'],
        'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none'
      },
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });

    try {
      // Set proper CORS headers including capitalized MCP header
      res.header("Access-Control-Expose-Headers", "Mcp-Session-Id, mcp-session-id, x-session-id, Content-Type, Authorization");

      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let sessionInfo: SessionInfo | undefined;

      if (sessionId && this.sessions.has(sessionId)) {
        // Reuse existing session
        sessionInfo = this.sessions.get(sessionId)!;
        sessionInfo.lastAccessed = new Date();

        console.log("📡 [MCP] Reusing existing session", {
          sessionId,
          timestamp: new Date().toISOString()
        });

        // Let the session's transport handle the request
        await sessionInfo.transport.handleRequest(req, res);

      } else if ((sessionId && !this.sessions.has(sessionId)) || (!sessionId && req.method === 'POST')) {
        // Recreate lost session OR create new session for any POST without session ID
        const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        if (sessionId && !this.sessions.has(sessionId)) {
          console.log("📡 [MCP] Session lost (likely container restart), recreating session", {
            sessionId: newSessionId,
            timestamp: new Date().toISOString()
          });
        }

        // Extract auth info if available
        // Use the Google access token from req.auth.extra instead of the wrapper JWT
        const sessionAuth = req.auth?.extra?.googleAccessToken ? {
          accessToken: String(req.auth.extra.googleAccessToken),
          refreshToken: String(req.auth.extra?.googleRefreshToken || ""),
          username: String(req.auth.extra?.userId || "unknown"),
        } : undefined;

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
          onsessioninitialized: (sid) => {
            logger.info(`🔗 Session initialized: ${sid}`);
          }
        });

        const server = this.createServer(newSessionId, sessionAuth);
        await server.connect(transport);

        sessionInfo = {
          server,
          transport,
          auth: sessionAuth,
          createdAt: new Date(),
          lastAccessed: new Date(),
        };

        this.sessions.set(newSessionId, sessionInfo);

        console.log("📡 [MCP] New session created for initialization", {
          sessionId: newSessionId,
          hasAuth: !!sessionAuth,
          userId: sessionAuth?.username,
          timestamp: new Date().toISOString()
        });

        // Create a response wrapper that preserves our session headers
        const originalSetHeader = res.setHeader.bind(res);
        const originalEnd = res.end.bind(res);
        const originalWrite = res.write.bind(res);
        const originalWriteHead = res.writeHead.bind(res);

        // Preserve session headers
        const sessionHeaders = {
          "mcp-session-id": newSessionId,
          "x-session-id": newSessionId,
          "Mcp-Session-Id": newSessionId
        };

        // Override writeHead to inject session headers (handle all signatures)
        res.writeHead = function(statusCode: number, statusMessage?: any, headers?: any) {
          let finalHeaders: any;
          let finalStatusMessage: any;

          // Handle different writeHead signatures
          if (typeof statusMessage === 'string') {
            finalHeaders = { ...headers, ...sessionHeaders };
            finalStatusMessage = statusMessage;
          } else {
            finalHeaders = { ...statusMessage, ...sessionHeaders };
            finalStatusMessage = undefined;
          }

          console.log("📡 [MCP] Injecting session headers in writeHead", {
            sessionId: newSessionId,
            statusCode,
            finalHeaders: Object.keys(finalHeaders || {}),
            timestamp: new Date().toISOString()
          });

          if (finalStatusMessage) {
            return originalWriteHead(statusCode, finalStatusMessage, finalHeaders);
          } else {
            return originalWriteHead(statusCode, finalHeaders);
          }
        } as any;

        // Override write to inject headers before first write (for SSE)
        res.write = function(chunk: any, encoding?: any, callback?: any) {
          if (!res.headersSent) {
            Object.entries(sessionHeaders).forEach(([key, value]) => {
              originalSetHeader(key, value);
            });
            console.log("📡 [MCP] Session headers set in write() before first chunk", {
              sessionId: newSessionId,
              timestamp: new Date().toISOString()
            });
          }
          return originalWrite(chunk, encoding, callback);
        } as any;

        // Override end to ensure session headers are set and log response body
        res.end = function(chunk?: any, encoding?: any, callback?: any) {
          if (!res.headersSent) {
            Object.entries(sessionHeaders).forEach(([key, value]) => {
              originalSetHeader(key, value);
            });
            console.log("📡 [MCP] Final session headers set in end()", {
              sessionId: newSessionId,
              headersSent: res.headersSent,
              timestamp: new Date().toISOString()
            });
          }

          // Log response body for debugging
          if (chunk) {
            try {
              const body = chunk.toString();
              console.log("📡 [MCP] Response body", {
                sessionId: newSessionId,
                body: body.substring(0, 500), // First 500 chars
                timestamp: new Date().toISOString()
              });
            } catch (e) {
              // Ignore if not convertible to string
            }
          }

          return originalEnd(chunk, encoding, callback);
        } as any;

        console.log("📡 [MCP] Response wrapper configured", {
          sessionId: newSessionId,
          timestamp: new Date().toISOString()
        });

        // Let the transport handle the request
        await transport.handleRequest(req, res);

        console.log("📡 [MCP] After transport handling", {
          sessionId: newSessionId,
          headersSent: res.headersSent,
          timestamp: new Date().toISOString()
        });

      } else {
        // Handle invalid requests
        const errorMessage = sessionId ? "Session not found" : "Missing session ID or not initialization request";
        const errorCode = sessionId ? -32001 : -32600;

        console.log("📡 [MCP] Invalid request", {
          sessionId,
          method: req.method,
          errorMessage,
          timestamp: new Date().toISOString()
        });

        res.status(sessionId ? 404 : 400).json({
          jsonrpc: "2.0",
          error: {
            code: errorCode,
            message: errorMessage,
          },
          id: req.body?.id || null,
        });
        return;
      }

      logger.debug(`MCP request completed in ${Date.now() - startTime}ms for session ${sessionId}`);
    } catch (error) {
      console.error("📡 [MCP] Request failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        method: req.method,
        url: req.url,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      logger.error("MCP request failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal error",
          },
          id: null,
        });
      }
    }
  }


  /**
   * Clean up old sessions
   */
  private cleanupOldSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, sessionInfo] of this.sessions.entries()) {
      const age = now - sessionInfo.lastAccessed.getTime();
      if (age > this.SESSION_TIMEOUT_MS) {
        // Close server and transport
        sessionInfo.server.close();
        sessionInfo.transport.close();
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 Cleaned up ${cleaned} old sessions`);
    }
  }

  /**
   * Get the server instance for a specific session
   */
  getServerForSession(sessionId: string): Server | undefined {
    const sessionInfo = this.sessions.get(sessionId);
    return sessionInfo?.server;
  }

  /**
   * Get all active servers
   */
  getAllServers(): Server[] {
    return Array.from(this.sessions.values()).map((info) => info.server);
  }

  /**
   * Get any server instance (for compatibility)
   */
  getServer(): Server {
    const firstSession = this.sessions.values().next().value;
    if (firstSession) {
      return firstSession.server;
    }
    // Create a temporary server if none exist
    return new Server(serverConfig, serverCapabilities);
  }

  /**
   * Clean up session
   */
  cleanupSession(sessionId: string): void {
    const sessionInfo = this.sessions.get(sessionId);
    if (sessionInfo) {
      sessionInfo.server.close();
      sessionInfo.transport.close();
      this.sessions.delete(sessionId);
      logger.debug(`🧹 Cleaned up session: ${sessionId}`);
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Shutdown handler
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all sessions
    for (const sessionInfo of this.sessions.values()) {
      sessionInfo.server.close();
      sessionInfo.transport.close();
    }
    this.sessions.clear();

    logger.info("🛑 MCP Handler shut down");
  }
}

// Global instance for notifications
let mcpHandlerInstance: MCPHandler | null = null;

export function setMCPHandlerInstance(handler: MCPHandler): void {
  mcpHandlerInstance = handler;
}

export function getMCPHandlerInstance(): MCPHandler | null {
  return mcpHandlerInstance;
}
