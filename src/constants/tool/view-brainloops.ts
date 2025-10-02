/**
 * View all user's brainloops
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const viewBrainloops: Tool = {
  name: "view_brainloops",
  description: "View all your brainloops (learning courses). See what brainloops you've created or enrolled in.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
