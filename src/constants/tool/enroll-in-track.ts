/**
 * Enroll in a BrainTrack
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const enrollInTrack: Tool = {
  name: "enroll_in_track",
  description: "Enroll in a BrainTrack. This will automatically enroll you in all courses within the track, providing a structured learning path.",
  inputSchema: {
    type: "object",
    properties: {
      trackId: {
        type: "string",
        description: "The ID of the track to enroll in",
      },
    },
    required: ["trackId"],
  },
};
