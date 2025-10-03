/**
 * @file Tool constants and utilities for the Reddit MCP server
 * @module constants/tools
 * 
 * @remarks
 * This module aggregates all available MCP tools and provides utilities
 * for tool management. Tools are the primary way clients interact with
 * the Reddit API through this MCP server.
 * 
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/core/tools | MCP Tools Specification}
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { createBrainloop } from '../constants/tool/create-brainloop.js';
import { viewBrainloops } from '../constants/tool/view-brainloops.js';
import { expandBrainloop } from '../constants/tool/expand-brainloop.js';
import { brainloopProgress } from '../constants/tool/brainloop-progress.js';
import { getBrainloop } from '../constants/tool/get-brainloop.js';
import { createInteraction } from '../constants/tool/create-interaction.js';
import { createPrompt } from '../constants/tool/create-prompt.js';
import { createPromptsBatch } from '../constants/tool/create-prompts-batch.js';
import { getLessonPrompts } from '../constants/tool/get-lesson-prompts.js';
import { updateLesson } from '../constants/tool/update-lesson.js';
import { updateUnit } from '../constants/tool/update-unit.js';
import { getUnitLessons } from '../constants/tool/get-unit-lessons.js';
import type { RedditConfigData } from '../types/config.js';

/**
 * Standard error messages for tool operations.
 * 
 * @remarks
 * These messages are used when tool calls fail or when
 * an unknown tool is requested.
 */
export const TOOL_ERROR_MESSAGES = {
  /** Prefix for unknown tool errors */
  UNKNOWN_TOOL: 'Unknown tool:',
  /** Prefix for tool execution failures */
  TOOL_CALL_FAILED: 'Tool call failed:',
} as const;

/**
 * Standard response messages for tool operations.
 * 
 * @remarks
 * These messages are used for special tool responses,
 * such as when a tool triggers an asynchronous operation.
 */
export const TOOL_RESPONSE_MESSAGES = {
  /** Message returned when a tool triggers async processing (e.g., sampling) */
  ASYNC_PROCESSING: 'Request is being processed asynchronously',
} as const;

/**
 * Array of all available brainloop tools.
 *
 * @remarks
 * Brainloop-centric tools for creating and managing learning experiences:
 * - `create_brainloop`: Create a complete brainloop about any topic
 * - `view_brainloops`: See all your brainloops
 * - `get_brainloop`: Get detailed information about a specific brainloop
 * - `expand_brainloop`: Add more content to an existing brainloop
 * - `brainloop_progress`: Track your learning progress
 * - `create_interaction`: Create an interaction container for lesson questions
 * - `create_prompt`: Create a single question/exercise for a lesson
 * - `create_prompts_batch`: Create multiple questions at once
 * - `get_lesson_prompts`: Get all questions for a lesson
 *
 * A "brainloop" is a complete learning experience - a structured course
 * with units and lessons designed for effective learning.
 *
 * @see {@link https://modelcontextprotocol.io/specification/2025-06-18/core/tools | MCP Tools}
 */
export const TOOLS: Tool[] = [
  createBrainloop,
  viewBrainloops,
  getBrainloop,
  expandBrainloop,
  brainloopProgress,
  getUnitLessons,
  createInteraction,
  createPrompt,
  createPromptsBatch,
  getLessonPrompts,
  updateLesson,
  updateUnit,
];

/**
 * Populates tools with initial data from Reddit configuration.
 * 
 * @remarks
 * This function can be used to inject user-specific data into tools
 * at initialization time. Currently, it creates a clone of each tool
 * to avoid modifying the original tool definitions.
 * 
 * @param tools - Array of tool definitions to populate
 * @param configData - Reddit configuration data containing user info
 * @returns Array of populated tool definitions
 * 
 * @example
 * ```typescript
 * const populatedTools = populateToolsInitialData(TOOLS, redditConfig);
 * ```
 */
export function populateToolsInitialData(tools: Tool[], _configData: RedditConfigData): Tool[] {
  return tools.map((tool) => {
    const clonedTool = { ...tool };
    return clonedTool;
  });
}
