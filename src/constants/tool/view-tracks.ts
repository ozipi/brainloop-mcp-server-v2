/**
 * View all user's tracks
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const viewTracks: Tool = {
  name: "view_tracks",
  description: "View all BrainTracks accessible to you - including tracks you created, public tracks, and tracks you're enrolled in. Shows track details, course count, and enrollment status.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
