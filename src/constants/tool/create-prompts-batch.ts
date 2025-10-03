/**
 * Create multiple prompts at once for an interaction
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createPromptsBatch: Tool = {
  name: "create_prompts_batch",
  description: "Create multiple prompts (questions/exercises) at once for an interaction. Useful when you have several questions ready. However, creating prompts one-by-one is recommended for better error handling and verification.",
  inputSchema: {
    type: "object",
    properties: {
      interactionId: {
        type: "string",
        description: "The ID of the interaction to add prompts to",
      },
      prompts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "The question text or prompt instruction",
            },
            type: {
              type: "string",
              enum: ["multiple-choice", "single-choice", "short-answer", "true-false", "code", "interactive-component"],
              description: "Type of prompt",
            },
            options: {
              type: "array",
              items: { type: "string" },
              description: "Options for multiple-choice questions",
            },
            answer: {
              description: "The correct answer",
            },
            explanation: {
              type: "string",
              description: "Explanation of the correct answer",
            },
            codeLanguage: {
              type: "string",
              description: "Programming language for code questions",
            },
            codeStarterCode: {
              type: "string",
              description: "Starter code for code questions",
            },
            componentType: {
              type: "string",
              description: "Type of interactive component",
            },
            componentConfig: {
              description: "Configuration for interactive component",
            },
          },
          required: ["question", "type"],
        },
        description: "Array of prompts to create",
      },
    },
    required: ["interactionId", "prompts"],
  },
};
