/**
 * @file Request context types for MCP handlers
 * @module types/request-context
 * 
 * @remarks
 * This module defines the context types passed to MCP handler functions.
 * These types ensure type safety for authentication data and session
 * information throughout the request lifecycle.
 * 
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/server/authentication | MCP Authentication}
 */

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * Extended authentication information with Brainloop-specific data.
 * 
 * @remarks
 * This interface extends the base MCP AuthInfo type to include
 * Google OAuth tokens and user information in the extra field.
 * The extra field is populated after successful OAuth authentication.
 * 
 * @example
 * ```typescript
 * const authInfo: AuthInfo = {
 *   clientId: "mcp-client-123",
 *   token: "jwt_token_here",
 *   extra: {
 *     userId: "user_id",
 *     googleAccessToken: "access_token_here",
 *     googleRefreshToken: "refresh_token_here"
 *   }
 * };
 * ```
 */

/**
 * Context passed from MCP server to tool handler functions.
 *
 * @remarks
 * This context provides all necessary information for handlers to:
 * - Authenticate Brainloop API requests
 * - Track session state
 * - Access user-specific data
 * - Refresh expired tokens
 *
 * @example
 * ```typescript
 * export async function handleTool(
 *   args: ToolArgs,
 *   context: MCPToolContext
 * ): Promise<ToolResult> {
 *   const { sessionId, authInfo, refreshTokenCallback } = context;
 *   const userId = authInfo.extra?.userId;
 *   // Use context for Brainloop API calls
 * }
 * ```
 */
export interface MCPToolContext {
  /**
   * Unique session identifier for the current MCP connection.
   * Used to track per-session state and route notifications.
   */
  sessionId: string;

  /**
   * Authentication information including Google OAuth tokens.
   * Contains user identity and API credentials.
   */
  authInfo: AuthInfo;

  /**
   * Optional callback to refresh the access token when it expires.
   * Returns a new access token that replaces the expired one.
   */
  refreshTokenCallback?: () => Promise<string>;
}

