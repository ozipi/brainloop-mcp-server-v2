/**
 * Create a new BrainTrack (collection of courses)
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createTrack: Tool = {
  name: "create_track",
  description: "Create a new BrainTrack - a curated collection of courses organized around a specific learning goal. Tracks provide structured learning paths where learners can enroll in multiple courses at once.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the track (e.g., 'Full Stack Development Path')",
      },
      description: {
        type: "string",
        description: "Description of the learning path and goals",
      },
      icon: {
        type: "string",
        description: "Emoji icon for the track (optional)",
      },
      hero: {
        type: "string",
        description: "Hero image URL for the track (optional)",
      },
      isPrivate: {
        type: "boolean",
        description: "Make this track private (only visible to you)",
        default: true,
      },
      slug: {
        type: "string",
        description: "URL-friendly slug for the track (auto-generated if not provided)",
      },
    },
    required: ["title", "description"],
  },
};
