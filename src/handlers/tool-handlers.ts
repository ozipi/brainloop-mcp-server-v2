/**
 * @file MCP Tool request handlers
 * @module handlers/tool-handlers
 * 
 * @remarks
 * This module implements the MCP tool handling functionality, managing
 * both tool listing and tool invocation. It serves as the main entry point
 * for all tool-related operations in the Reddit MCP server.
 * 
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/core/tools | MCP Tools Specification}
 */

import type {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { TOOLS, TOOL_ERROR_MESSAGES } from '../constants/tools.js';
import { BrainloopService } from '../services/brainloop/brainloop-service.js';
import { logger } from '../utils/logger.js';
import type { RedditAuthInfo, MCPToolContext } from '../types/request-context.js';
import {
  handleCreateBrainloop,
  handleViewBrainloops,
  handleGetBrainloop,
  handleExpandBrainloop,
  handleBrainloopProgress,
  handleGetUnitLessons,
  handleCreateInteraction,
  handleCreatePrompt,
  handleCreatePromptsBatch,
  handleGetLessonPrompts,
  handleUpdateLesson,
  handleUpdateUnit,
  handleDetectDuplicates,
  handleCleanupEmptyContent,
  handleReorderUnits,
} from './tools/brainloop-handlers.js';

/**
 * Zod schemas for brainloop tool validation
 */
const ToolSchemas = {
  create_brainloop: z.object({
    title: z.string().min(1).describe("Title of the brainloop"),
    description: z.string().min(1).describe("Description of the brainloop"),
    topics: z.array(z.string()).min(1).describe("List of topics/units for the brainloop"),
    isPublic: z.boolean().optional().describe("Make brainloop public"),
    isPublished: z.boolean().optional().describe("Publish brainloop immediately"),
  }),
  view_brainloops: z.object({}),
  get_brainloop: z.object({
    brainloopId: z.string().min(1).describe("The ID of the brainloop"),
  }),
  expand_brainloop: z.object({
    brainloopId: z.string().min(1).describe("The ID of the brainloop to expand"),
    units: z.array(z.object({
      title: z.string().min(1).describe("Unit title"),
      description: z.string().min(1).describe("Unit description"),
      lessons: z.array(z.object({
        title: z.string().min(1).describe("Lesson title"),
        content: z.string().min(1).describe("Lesson content"),
      })).min(1).describe("Lessons for this unit"),
    })).min(1).describe("Units to add"),
  }),
  brainloop_progress: z.object({
    brainloopId: z.string().optional().describe("Specific brainloop ID (optional)"),
  }),
  create_interaction: z.object({
    lessonId: z.string().min(1).describe("The ID of the lesson"),
    type: z.string().optional().describe("Interaction type (assessment, exercise, reflection)"),
  }),
  create_prompt: z.object({
    interactionId: z.string().min(1).describe("The ID of the interaction"),
    question: z.string().min(1).describe("The question text"),
    type: z.string().min(1).describe("Prompt type (multiple-choice, single-choice, short-answer, etc.)"),
    options: z.array(z.string()).optional().describe("Options for choice questions"),
    answer: z.any().optional().describe("The correct answer"),
    explanation: z.string().optional().describe("Explanation of the answer"),
    codeLanguage: z.string().optional().describe("Programming language for code questions"),
    codeStarterCode: z.string().optional().describe("Starter code for code questions"),
    codeExpectedOutput: z.string().optional().describe("Expected output for code questions"),
    codeTestCases: z.any().optional().describe("Test cases for code questions"),
    codeTimeLimit: z.number().optional().describe("Time limit for code execution"),
    codeMemoryLimit: z.number().optional().describe("Memory limit for code execution"),
    componentType: z.string().optional().describe("Interactive component type"),
    componentConfig: z.any().optional().describe("Component configuration"),
    componentAnswer: z.any().optional().describe("Expected component answer"),
  }),
  create_prompts_batch: z.object({
    interactionId: z.string().min(1).describe("The ID of the interaction"),
    prompts: z.array(z.object({
      question: z.string().min(1).describe("The question text"),
      type: z.string().min(1).describe("Prompt type"),
      options: z.array(z.string()).optional().describe("Options for choice questions"),
      answer: z.any().optional().describe("The correct answer"),
      explanation: z.string().optional().describe("Explanation of the answer"),
      codeLanguage: z.string().optional().describe("Programming language for code questions"),
      codeStarterCode: z.string().optional().describe("Starter code for code questions"),
      componentType: z.string().optional().describe("Interactive component type"),
      componentConfig: z.any().optional().describe("Component configuration"),
    })).min(1).describe("Array of prompts to create"),
  }),
  get_lesson_prompts: z.object({
    lessonId: z.string().min(1).describe("The ID of the lesson"),
  }),
  update_lesson: z.object({
    lessonId: z.string().min(1).describe("The ID of the lesson to update"),
    title: z.string().optional().describe("New lesson title"),
    content: z.string().optional().describe("New lesson content"),
    videoUrl: z.string().optional().describe("New video URL"),
  }),
  update_unit: z.object({
    unitId: z.string().min(1).describe("The ID of the unit to update"),
    title: z.string().optional().describe("New unit title"),
    description: z.string().optional().describe("New unit description"),
  }),
  get_unit_lessons: z.object({
    unitId: z.string().min(1).describe("The ID of the unit"),
  }),
  detect_duplicates: z.object({
    courseId: z.string().min(1).describe("The ID of the course to check for duplicates"),
  }),
  cleanup_empty_content: z.object({
    courseId: z.string().min(1).describe("The ID of the course to clean up"),
    dryRun: z.boolean().optional().describe("Preview mode - show what would be deleted without actually deleting"),
  }),
  reorder_units: z.object({
    brainloopId: z.string().min(1).describe("The course ID containing the units to reorder"),
    unitIds: z.array(z.string()).min(1).describe("Array of unit IDs in desired order"),
  }),
  search_reddit: z.object({
    query: z.string().min(1).max(500).describe("Search query"),
    subreddit: z.string().optional().describe("Specific subreddit to search (optional)"),
    sort: z.enum(["relevance", "hot", "new", "top"]).default("relevance").describe("Sort order for results"),
    time: z.enum(["hour", "day", "week", "month", "year", "all"]).default("all").describe("Time filter for results"),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum number of results")
  }),
  
  get_channel: z.object({
    subreddit: z.string().min(1).describe("Name of the subreddit (without r/ prefix)"),
    sort: z.enum(["hot", "new", "controversial"]).default("hot").describe("Sort order for posts")
  }),
  
  get_post: z.object({
    id: z.string().describe("The unique identifier of the post to retrieve")
  }),
  
  get_notifications: z.object({
    filter: z.enum(["all", "unread", "messages", "comments", "mentions"]).optional().describe("Filter notifications"),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum number of notifications"),
    markRead: z.boolean().optional().describe("Mark notifications as read"),
    excludeIds: z.array(z.string()).optional().describe("IDs to exclude"),
    excludeTypes: z.array(z.enum(["comment_reply", "post_reply", "username_mention", "message", "other"])).optional().describe("Types to exclude"),
    excludeSubreddits: z.array(z.string()).optional().describe("Subreddits to exclude"),
    after: z.string().optional().describe("Cursor for pagination"),
    before: z.string().optional().describe("Cursor for pagination")
  }),
  
  get_comment: z.object({
    id: z.string().describe("The unique identifier of the comment"),
    includeThread: z.boolean().optional().describe("Include full comment thread")
  }),
  
  elicitation_example: z.object({
    type: z.enum(["input", "confirm", "choice"]).describe("Type of elicitation"),
    prompt: z.string().describe("Prompt to show to user"),
    options: z.array(z.string()).optional().describe("Options for choice type")
  }),
  
  sampling_example: z.object({
    taskType: z.enum(['summarize', 'generate', 'analyze', 'translate']).describe("The type of sampling task to demonstrate"),
    content: z.string().describe("Input content for the sampling task"),
    targetLanguage: z.string().optional().describe("Target language for translation tasks"),
    style: z.enum(['formal', 'casual', 'technical', 'creative']).optional().describe("Style preferences for generation tasks")
  }),
  
  structured_data_example: z.object({
    dataType: z.enum(['user', 'analytics', 'weather', 'product']).describe('The type of structured data to return'),
    id: z.string().optional().describe('Optional ID to fetch specific data'),
    includeNested: z.boolean().optional().default(false).describe('Whether to include nested data structures'),
    simulateError: z.boolean().optional().default(false).describe('Whether to simulate validation errors for testing')
  }).strict(),
  
  mcp_logging: z.object({
    level: z.enum(["debug", "info", "warning", "error"]).describe("Log level"),
    message: z.string().describe("Message to log"),
    data: z.unknown().optional().describe("Optional additional data")
  }),
  
  validation_example: z.object({
    name: z.string().min(2).max(50).regex(/^[a-zA-Z ]+$/).describe("Name (letters and spaces only, 2-50 chars)"),
    age: z.number().int().min(0).max(150).describe("Age in years (0-150)"),
    email: z.string().email().describe("Valid email address"),
    role: z.enum(["user", "admin", "moderator"]).describe("User role"),
    preferences: z.object({
      theme: z.enum(["light", "dark", "auto"]).optional().default("auto"),
      notifications: z.boolean().optional().default(true)
    }).optional(),
    tags: z.array(z.string().min(1)).min(0).max(10).optional().describe("List of tags (max 10, unique)")
  })
};

/**
 * Type mapping of tool names to their argument types.
 * 
 * @remarks
 * This type ensures type safety when dispatching tool calls
 * to their respective handlers.
 */
type ToolArgs = {
  create_brainloop: any;
  view_brainloops: any;
  get_brainloop: any;
  expand_brainloop: any;
  brainloop_progress: any;
  get_unit_lessons: any;
  create_interaction: any;
  create_prompt: any;
  create_prompts_batch: any;
  get_lesson_prompts: any;
  update_lesson: any;
  update_unit: any;
};

/**
 * Handles MCP tool listing requests.
 * 
 * @remarks
 * Returns all available tools sorted alphabetically by name.
 * This allows MCP clients to discover what tools are available
 * for interacting with Reddit.
 * 
 * @param _request - The tool listing request (currently unused)
 * @returns Promise resolving to the list of available tools
 * 
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/core/tools#listing-tools | Listing Tools}
 */
export async function handleListTools(_request: ListToolsRequest): Promise<ListToolsResult> {
  try {
    logger.info(`🔧 handleListTools called, TOOLS.length: ${TOOLS.length}`);
    const tools = [...TOOLS].sort((a, b) => a.name.localeCompare(b.name));
    logger.info(`✅ Returning ${tools.length} tools: ${tools.map(t => t.name).join(', ')}`);
    return { tools };
  } catch (error) {
    logger.error("Failed to list tools", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { tools: TOOLS };
  }
}

/**
 * BRAINLOOP authentication credentials structure.
 *
 * @remarks
 * Contains the OAuth token and user ID needed to authenticate
 * requests to the BRAINLOOP API.
 */
interface BrainloopCredentials {
  /** OAuth2 access token for API requests */
  accessToken: string;
  /** User ID */
  userId: string;
}

/**
 * Extracts and validates BRAINLOOP credentials from AuthInfo.
 *
 * @remarks
 * This function ensures that all required authentication data
 * is present before attempting to make BRAINLOOP API calls.
 *
 * @param authInfo - Authentication information from the MCP context
 * @returns Validated BRAINLOOP credentials
 * @throws Error if required credentials are missing or invalid
 */
function extractAndValidateCredentials(authInfo: RedditAuthInfo): BrainloopCredentials {
  if (!authInfo.token) {
    throw new Error("Authentication failed: Missing access token");
  }

  const userId = (authInfo.extra?.userId as string) || 'unknown';

  try {
    return {
      accessToken: authInfo.token,
      userId,
    };
  } catch (error) {
    logger.error("BRAINLOOP credentials validation failed", {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    throw error;
  }
}

/**
 * Handles MCP tool invocation requests.
 * 
 * @remarks
 * This is the main dispatcher for tool calls. It:
 * 1. Validates the requested tool exists
 * 2. Extracts and validates authentication credentials
 * 3. Validates tool arguments against the tool's input schema
 * 4. Creates a Reddit service instance
 * 5. Dispatches to the appropriate tool handler
 * 6. Returns the tool result or error
 * 
 * Tools that require content generation (like create_post) will trigger
 * the sampling feature and return an async processing message.
 * 
 * @param request - The tool invocation request containing tool name and arguments
 * @param context - MCP context containing authentication and session information
 * @returns Promise resolving to the tool execution result
 * @throws Error if tool is unknown, auth fails, or execution fails
 * 
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/core/tools#calling-tools | Calling Tools}
 */
export async function handleToolCall(
  request: CallToolRequest,
  context: MCPToolContext,
): Promise<CallToolResult> {
  
  try {
    logger.info(`🔧 handleToolCall called for tool: ${request.params.name}`);
    // Extract and validate BRAINLOOP credentials from AuthInfo
    const credentials = extractAndValidateCredentials(context.authInfo);

    if (!request.params.arguments) {
      logger.error("Tool call missing required arguments", { toolName: request.params?.name });
      throw new Error("Arguments are required");
    }

    const tool = TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      logger.error("Unknown tool requested", { toolName: request.params.name });
      throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }


    // Validate arguments using Zod schema
    const toolName = request.params.name as keyof typeof ToolSchemas;
    const schema = ToolSchemas[toolName];
    
    if (!schema) {
      logger.error("No Zod schema found for tool", { toolName });
      throw new Error(`No validation schema found for tool: ${toolName}`);
    }
    
    let args: ToolArgs[keyof ToolArgs];
    try {
      const validatedArgs = schema.parse(request.params.arguments);
      args = validatedArgs as ToolArgs[keyof ToolArgs];
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Tool argument validation failed", { 
          toolName, 
          errors: error.errors,
          arguments: request.params.arguments 
        });
        throw new Error(`Invalid arguments for tool ${toolName}: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }


    let result: CallToolResult;

    // Create brainloop service for brainloop tools
    const brainloopService = new BrainloopService({
      accessToken: credentials.accessToken,
      userId: credentials.userId,
      refreshTokenCallback: context.refreshTokenCallback,
    });

    const brainloopContext = {
      brainloopService,
      userId: credentials.userId,
      sessionId: context.sessionId,
    };

    switch (request.params.name) {
      case "create_brainloop":
        result = await handleCreateBrainloop(args as any, brainloopContext);
        break;
      case "view_brainloops":
        result = await handleViewBrainloops(args, brainloopContext);
        break;
      case "get_brainloop":
        result = await handleGetBrainloop(args as any, brainloopContext);
        break;
      case "expand_brainloop":
        result = await handleExpandBrainloop(args as any, brainloopContext);
        break;
      case "brainloop_progress":
        result = await handleBrainloopProgress(args as any, brainloopContext);
        break;
      case "get_unit_lessons":
        result = await handleGetUnitLessons(args as any, brainloopContext);
        break;
      case "create_interaction":
        result = await handleCreateInteraction(args as any, brainloopContext);
        break;
      case "create_prompt":
        result = await handleCreatePrompt(args as any, brainloopContext);
        break;
      case "create_prompts_batch":
        result = await handleCreatePromptsBatch(args as any, brainloopContext);
        break;
      case "get_lesson_prompts":
        result = await handleGetLessonPrompts(args as any, brainloopContext);
        break;
      case "update_lesson":
        result = await handleUpdateLesson(args as any, brainloopContext);
        break;
      case "update_unit":
        result = await handleUpdateUnit(args as any, brainloopContext);
        break;
      case "detect_duplicates":
        result = await handleDetectDuplicates(args as any, brainloopContext);
        break;
      case "cleanup_empty_content":
        result = await handleCleanupEmptyContent(args as any, brainloopContext);
        break;
      case "reorder_units":
        result = await handleReorderUnits(args as any, brainloopContext);
        break;
      default:
        logger.error("Unsupported tool in switch statement", { toolName: request.params.name });
        throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Tool call failed", {
      toolName: request.params?.name,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw the error to be handled by MCP framework
    throw error;
  }
}
