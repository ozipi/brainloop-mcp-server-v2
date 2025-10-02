/**
 * Create a complete brainloop (learning experience)
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createBrainloop: Tool = {
  name: "create_brainloop",
  description: "Create a complete brainloop (learning course) about any topic. A brainloop is a structured learning experience with lessons organized into units.",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the brainloop (e.g., 'Machine Learning Fundamentals')",
      },
      description: {
        type: "string",
        description: "Description of what learners will gain from this brainloop",
      },
      topics: {
        type: "array",
        items: { type: "string" },
        description: "List of topics/units to cover in this brainloop",
      },
      isPublic: {
        type: "boolean",
        description: "Make this brainloop publicly accessible",
        default: false,
      },
      isPublished: {
        type: "boolean",
        description: "Publish this brainloop immediately",
        default: true,
      },
    },
    required: ["title", "description", "topics"],
  },
};
