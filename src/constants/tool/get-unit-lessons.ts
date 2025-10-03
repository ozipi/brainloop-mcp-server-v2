/**
 * Get all lessons for a unit
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getUnitLessons: Tool = {
  name: "get_unit_lessons",
  description: "Get all lessons for a specific unit. Use this to see the lesson IDs and details for lessons in a unit. This is necessary to get lesson IDs before creating interactions or prompts.",
  inputSchema: {
    type: "object",
    properties: {
      unitId: {
        type: "string",
        description: "The ID of the unit to get lessons for",
      },
    },
    required: ["unitId"],
  },
};
