/**
 * Update an existing unit
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const updateUnit: Tool = {
  name: "update_unit",
  description: "Update an existing unit's details. Use this to fix typos, update descriptions, or correct mistakes without creating duplicates. Supports partial updates - only provide the fields you want to change.",
  inputSchema: {
    type: "object",
    properties: {
      unitId: {
        type: "string",
        description: "The ID of the unit to update",
      },
      title: {
        type: "string",
        description: "New unit title (optional - only if changing)",
      },
      description: {
        type: "string",
        description: "New unit description (optional - only if changing)",
      },
    },
    required: ["unitId"],
  },
};
