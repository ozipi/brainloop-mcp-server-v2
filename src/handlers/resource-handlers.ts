import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type {
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
} from '@modelcontextprotocol/sdk/types.js';
import { BrainloopService } from '../services/brainloop/brainloop-service.js';
import {
  RESOURCES,
  RESOURCE_CONTENT,
  RESOURCE_ERROR_MESSAGES,
  SERVER_INFO
} from '../constants/resources.js';



export async function handleListResources(): Promise<ListResourcesResult> {
  try {
    return { resources: [...RESOURCES] };
  } catch (error) {
    throw new Error(RESOURCE_ERROR_MESSAGES.LIST_FAILED(error));
  }
}

export async function handleResourceCall(
  request: ReadResourceRequest,
  extra?: { authInfo?: AuthInfo },
): Promise<ReadResourceResult> {
  const authInfo = extra?.authInfo;

  try {
    const { uri } = request.params;

    if (uri === "brainloop://config") {
      if (!authInfo?.token) {
        throw new Error(RESOURCE_ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
      }

      const userId = (authInfo.extra?.userId as string) || 'unknown';
      const brainloopService = new BrainloopService({
        accessToken: authInfo.token,
        userId,
      });

      const [profile, analytics] = await Promise.all([
        brainloopService.getUserProfile(),
        brainloopService.getUserAnalytics(),
      ]);

      const config = {
        user: profile,
        analytics,
        authenticated: true,
        server: SERVER_INFO,
      };

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(config, null, 2),
          },
        ],
      };
    }

    if (uri === "guidelines://brainloop-creation") {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: RESOURCE_CONTENT.BRAINLOOP_CREATION_GUIDE,
          },
        ],
      };
    }

    if (uri === "guidelines://learning-design") {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: RESOURCE_CONTENT.LEARNING_DESIGN_PRINCIPLES,
          },
        ],
      };
    }

    if (uri === "guidelines://content-structure") {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: RESOURCE_CONTENT.CONTENT_STRUCTURE_GUIDELINES,
          },
        ],
      };
    }

    if (uri === "template://brainloop") {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: RESOURCE_CONTENT.BRAINLOOP_TEMPLATE,
          },
        ],
      };
    }

    if (uri === "stats://server") {
      const stats = {
        server: {
          name: SERVER_INFO.name,
          version: SERVER_INFO.version,
          uptime: process.uptime(),
          platform: process.platform,
          nodeVersion: process.version,
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: "MB"
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        capabilities: {
          tools: true,
          prompts: true,
          resources: true,
          sampling: true
        }
      };

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    }

    throw new Error(RESOURCE_ERROR_MESSAGES.INVALID_URI(uri));
  } catch (error) {
    throw new Error(RESOURCE_ERROR_MESSAGES.FETCH_FAILED(error));
  }
}
