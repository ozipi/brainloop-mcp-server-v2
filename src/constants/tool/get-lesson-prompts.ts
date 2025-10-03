/**
 * Get all prompts for a lesson
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getLessonPrompts: Tool = {
  name: "get_lesson_prompts",
  description: "Get all prompts (questions/exercises) for a specific lesson. Use this to check what prompts already exist before adding new ones.",
  inputSchema: {
    type: "object",
    properties: {
      lessonId: {
        type: "string",
        description: "The ID of the lesson to get prompts for",
      },
    },
    required: ["lessonId"],
  },
};
