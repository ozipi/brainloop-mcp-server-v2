/**
 * Get detailed information about a brainloop
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getBrainloop: Tool = {
  name: "get_brainloop",
  description: "Get detailed information about a specific brainloop, including all its units and lessons structure.",
  inputSchema: {
    type: "object",
    properties: {
      brainloopId: {
        type: "string",
        description: "The ID of the brainloop to retrieve",
      },
    },
    required: ["brainloopId"],
  },
};
