/**
 * Get full content of a single lesson
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getLesson: Tool = {
  name: "get_lesson",
  description: "Get the complete content of a specific lesson including title, full text content, video URL, and metadata. Use this to read what's actually in a lesson (not just metadata).",
  inputSchema: {
    type: "object",
    properties: {
      lessonId: {
        type: "string",
        description: "The ID of the lesson to retrieve",
      },
    },
    required: ["lessonId"],
  },
};
