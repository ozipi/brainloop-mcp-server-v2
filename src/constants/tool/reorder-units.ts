import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const reorderUnits: Tool = {
  name: "reorder_units",
  description: "Reorder units in a brainloop by providing a list of unit IDs in the desired order. Use this to fix unit ordering when units are out of sequence. The first unit ID in the array will be order 1, second will be order 2, etc.",
  inputSchema: {
    type: "object",
    properties: {
      brainloopId: {
        type: "string",
        description: "The course ID containing the units to reorder"
      },
      unitIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of unit IDs in the desired order (first item = order 1, second = order 2, etc.)"
      }
    },
    required: ["brainloopId", "unitIds"]
  }
};
