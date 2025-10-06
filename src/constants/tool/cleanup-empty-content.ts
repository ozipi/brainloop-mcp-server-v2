import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const cleanupEmptyContent: Tool = {
  name: "cleanup_empty_content",
  description: "Remove empty units (units with no lessons or only empty lessons) from a course. This helps clean up failed creation attempts. IMPORTANT: This only removes units with completely empty lessons - units with real content are never touched.",
  inputSchema: {
    type: "object",
    properties: {
      courseId: {
        type: "string",
        description: "The course ID to clean up"
      },
      dryRun: {
        type: "boolean",
        description: "If true, only show what would be deleted without actually deleting. Default: false",
        default: false
      }
    },
    required: ["courseId"]
  }
};
