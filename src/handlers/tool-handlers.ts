/**
 * @file MCP Tool request handlers
 * @module handlers/tool-handlers
 * 
 * @remarks
 * This module implements the MCP tool handling functionality, managing
 * both tool listing and tool invocation. It serves as the main entry point
 * for all tool-related operations in the Brainloop MCP server.
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
import type { AuthInfo, MCPToolContext } from '../types/request-context.js';
import {
  handleCreateBrainloop,
  handleViewBrainloops,
  handleGetBrainloop,
  handleExpandBrainloop,
  handleBrainloopProgress,
  handleGetUnitLessons,
  handleGetLesson,
  handleCreateInteraction,
  handleCreatePrompt,
  handleCreatePromptsBatch,
  handleGetLessonPrompts,
  handleUpdateLesson,
  handleUpdateUnit,
  handleDetectDuplicates,
  handleCleanupEmptyContent,
  handleReorderUnits,
  handleMoveLesson,
} from './tools/brainloop-handlers.js';
import {
  handleCreateTrack,
  handleViewTracks,
  handleGetTrack,
  handleAddCourseToTrack,
  handleEnrollInTrack,
} from './tools/track-handlers.js';

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
  get_lesson: z.object({
    lessonId: z.string().min(1).describe("The ID of the lesson to retrieve full content"),
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
  move_lesson: z.object({
    lessonId: z.string().min(1).describe("The ID of the lesson to move"),
    targetUnitId: z.string().min(1).describe("The ID of the target unit"),
    newOrder: z.number().int().min(0).optional().describe("Optional new order position in target unit"),
  }),
  // BrainTrack tool schemas
  create_track: z.object({
    title: z.string().min(1).describe("Title of the track"),
    description: z.string().min(1).describe("Description of the learning path"),
    icon: z.string().optional().describe("Emoji icon for the track"),
    hero: z.string().optional().describe("Hero image URL"),
    isPrivate: z.boolean().optional().describe("Make track private"),
    slug: z.string().optional().describe("URL-friendly slug"),
  }),
  view_tracks: z.object({}),
  get_track: z.object({
    trackId: z.string().min(1).describe("The ID of the track"),
  }),
  add_course_to_track: z.object({
    trackId: z.string().min(1).describe("The ID of the track"),
    courseId: z.string().min(1).describe("The ID of the course to add"),
  }),
  enroll_in_track: z.object({
    trackId: z.string().min(1).describe("The ID of the track to enroll in"),
  }),
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
  get_lesson: any;
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
 * for interacting with Brainloop.
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
function extractAndValidateCredentials(authInfo: AuthInfo): BrainloopCredentials {
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
 * 4. Creates a Brainloop service instance
 * 5. Dispatches to the appropriate tool handler
 * 6. Returns the tool result or error
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

    logger.info(`🔧 [TOOL CALL START] ${toolName}`, {
      args,
      userId: credentials.userId,
      sessionId: context.sessionId
    });

    // Create brainloop service for brainloop tools
    const brainloopService = new BrainloopService({
      accessToken: credentials.accessToken,
      userId: credentials.userId,
      refreshTokenCallback: context.refreshTokenCallback,
    });

    logger.info(`✅ [BRAINLOOP SERVICE] Created for user`, { userId: credentials.userId });

    const brainloopContext = {
      brainloopService,
      userId: credentials.userId,
      sessionId: context.sessionId,
    };

    logger.info(`🎯 [TOOL DISPATCH] Calling handler for ${toolName}`);

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
      case "get_lesson":
        result = await handleGetLesson(args as any, brainloopContext);
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
      case "move_lesson":
        result = await handleMoveLesson(args as any, brainloopContext);
        break;
      // BrainTrack tools
      case "create_track":
        result = await handleCreateTrack(args as any, brainloopContext);
        break;
      case "view_tracks":
        result = await handleViewTracks(args, brainloopContext);
        break;
      case "get_track":
        result = await handleGetTrack(args as any, brainloopContext);
        break;
      case "add_course_to_track":
        result = await handleAddCourseToTrack(args as any, brainloopContext);
        break;
      case "enroll_in_track":
        result = await handleEnrollInTrack(args as any, brainloopContext);
        break;
      default:
        logger.error("Unsupported tool in switch statement", { toolName: request.params.name });
        throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }

    logger.info(`✅ [TOOL CALL COMPLETE] ${toolName}`, {
      hasResult: !!result,
      contentBlocks: result?.content?.length || 0
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(`❌ [TOOL CALL FAILED] ${request.params.name}`, {
      error: errorMessage,
      stack: errorStack,
      args: request.params.arguments,
      sessionId: context.sessionId
    });

    logger.error("Tool call failed", {
      toolName: request.params?.name,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw the error to be handled by MCP framework
    throw error;
  }
}
