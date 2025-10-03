/**
 * Update an existing lesson
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const updateLesson: Tool = {
  name: "update_lesson",
  description: "Update an existing lesson's content. Use this to fix empty lessons, correct mistakes, or update lesson content without creating duplicates. Supports partial updates - only provide the fields you want to change.",
  inputSchema: {
    type: "object",
    properties: {
      lessonId: {
        type: "string",
        description: "The ID of the lesson to update",
      },
      title: {
        type: "string",
        description: "New lesson title (optional - only if changing)",
      },
      content: {
        type: "string",
        description: "New lesson content (optional - only if changing)",
      },
      videoUrl: {
        type: "string",
        description: "New video URL (optional - only if changing)",
      },
    },
    required: ["lessonId"],
  },
};
