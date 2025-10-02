/**
 * Track progress through brainloops
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const brainloopProgress: Tool = {
  name: "brainloop_progress",
  description: "Track your progress through brainloops. See which lessons you've completed and your overall learning journey.",
  inputSchema: {
    type: "object",
    properties: {
      brainloopId: {
        type: "string",
        description: "Specific brainloop ID to check progress for (optional - if not provided, shows all progress)",
      },
    },
    required: [],
  },
};
