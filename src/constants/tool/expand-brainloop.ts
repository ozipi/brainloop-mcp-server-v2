/**
 * Expand an existing brainloop with more content
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const expandBrainloop: Tool = {
  name: "expand_brainloop",
  description: "Expand an existing brainloop by adding more lessons, units, or topics. Use this to grow your brainloop with additional learning content.",
  inputSchema: {
    type: "object",
    properties: {
      brainloopId: {
        type: "string",
        description: "The ID of the brainloop to expand (course ID)",
      },
      units: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the new unit/topic",
            },
            description: {
              type: "string",
              description: "Description of this unit",
            },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Lesson title",
                  },
                  content: {
                    type: "string",
                    description: "Lesson content (markdown supported)",
                  },
                },
                required: ["title", "content"],
              },
              description: "Lessons for this unit",
            },
          },
          required: ["title", "description", "lessons"],
        },
        description: "New units/topics to add to the brainloop",
      },
    },
    required: ["brainloopId", "units"],
  },
};
