/**
 * Get detailed information about a specific track
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getTrack: Tool = {
  name: "get_track",
  description: "Get detailed information about a specific BrainTrack, including all courses in the track, enrollment status, and progress information.",
  inputSchema: {
    type: "object",
    properties: {
      trackId: {
        type: "string",
        description: "The ID of the track to retrieve",
      },
    },
    required: ["trackId"],
  },
};
