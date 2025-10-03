/**
 * Expand an existing brainloop with more content
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const expandBrainloop: Tool = {
  name: "expand_brainloop",
  description: "Expand an existing brainloop by adding ONE lesson at a time. IMPORTANT: Add content incrementally - create one unit with ONE lesson (teaching content only, NO questions in lesson), verify it was added successfully by checking the response, then create 5 interactions for that lesson (questions/exercises), verify they were added, then proceed to the next lesson. This lesson→verify→5 interactions→verify workflow ensures quality, allows for adjustments, and prevents duplicate work if a failure occurs. DEFAULT: 5 interactions per lesson (user can specify different number).",
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
