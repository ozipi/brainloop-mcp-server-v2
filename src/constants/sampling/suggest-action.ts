import type { SamplingPrompt } from '../../types/sampling.js';

export const SUGGEST_ACTION_PROMPT: SamplingPrompt = {
  name: "brainloop_suggest_next",
  description: "Analyzes learning progress and suggests the next brainloop action",
  arguments: [
    {
      name: "userProgress",
      description: "JSON string of user's recent learning progress and courses",
      required: true,
    },
  ],
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "You are an expert learning strategist who analyzes learning patterns and progress to suggest optimal next actions. You understand learning science, spacing effects, and engagement patterns to maximize retention and growth.",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I understand the brainloop creation guidelines:\n{{brainloopGuidelines}}",
      },
    },
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I will follow these learning design principles:\n{{learningPrinciples}}",
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Analyze the following user progress and suggest the optimal next learning action:

User Progress:
{{userProgress}}

Based on this data:
1. Identify learning patterns or knowledge gaps
2. Determine the best action (continue current brainloop, start new topic, or review completed content)
3. Suggest a specific brainloop or lesson if applicable
4. Provide clear reasoning for your suggestion
5. Suggest learning path direction for optimal retention`,
      },
    },
  ],
  _meta: {
    callback: "suggest_action",
  },
};
