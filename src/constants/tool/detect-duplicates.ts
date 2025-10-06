import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const detectDuplicates: Tool = {
  name: "detect_duplicates",
  description: "Detect duplicate units and empty lessons in a course. Shows units with identical or very similar titles, and lessons with no content. Use this before creating new content to avoid duplicates.",
  inputSchema: {
    type: "object",
    properties: {
      courseId: {
        type: "string",
        description: "The course ID to check for duplicates"
      }
    },
    required: ["courseId"]
  }
};
