/**
 * Create an interaction for a lesson
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createInteraction: Tool = {
  name: "create_interaction",
  description: "Create an interaction (container for questions/exercises) for a lesson. Each lesson can have one interaction. This must be created before adding prompts.",
  inputSchema: {
    type: "object",
    properties: {
      lessonId: {
        type: "string",
        description: "The ID of the lesson to create an interaction for",
      },
      type: {
        type: "string",
        enum: ["assessment", "exercise", "reflection"],
        description: "Type of interaction (assessment, exercise, or reflection)",
        default: "assessment",
      },
    },
    required: ["lessonId"],
  },
};
