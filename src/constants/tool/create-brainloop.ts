/**
 * Create a complete brainloop (learning experience)
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createBrainloop: Tool = {
  name: "create_brainloop",
  description: "Create a new brainloop (learning course) with just the course structure and topics (NO lessons yet). A brainloop is a structured learning experience with lessons organized into units. After creating the structure, you MUST use expand_brainloop to add lessons ONE AT A TIME, verify each lesson, then add 5 interactions (questions/exercises) for that lesson, verify the interactions, then proceed to the next lesson. This lesson→verify→5 interactions→verify workflow prevents duplicate work if errors occur. DEFAULT: 5 interactions per lesson (user can specify different).",
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
