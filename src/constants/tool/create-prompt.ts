/**
 * Create a prompt (question/exercise) within an interaction
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createPrompt: Tool = {
  name: "create_prompt",
  description: "Create a single prompt (question/exercise) within an interaction. A prompt can be multiple-choice, short answer, code challenge, or other types. Create prompts one at a time for better error handling.",
  inputSchema: {
    type: "object",
    properties: {
      interactionId: {
        type: "string",
        description: "The ID of the interaction to add this prompt to",
      },
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
        description: "Array of options for multiple-choice or single-choice questions",
      },
      answer: {
        description: "The correct answer. For multiple-choice: index (0-based). For true-false: boolean. For short-answer/code: string or object.",
      },
      explanation: {
        type: "string",
        description: "Explanation of the correct answer (optional but recommended)",
      },
      // Code question fields
      codeLanguage: {
        type: "string",
        description: "Programming language for code questions (e.g., 'python', 'javascript')",
      },
      codeStarterCode: {
        type: "string",
        description: "Starter code provided to the user for code questions",
      },
      codeExpectedOutput: {
        type: "string",
        description: "Expected output for code questions",
      },
      codeTestCases: {
        description: "Test cases for code questions (JSON array of objects)",
      },
      codeTimeLimit: {
        type: "number",
        description: "Time limit in milliseconds for code execution",
      },
      codeMemoryLimit: {
        type: "number",
        description: "Memory limit in MB for code execution",
      },
      // Interactive component fields
      componentType: {
        type: "string",
        description: "Type of interactive component (e.g., 'hebrew-circle', 'alphabet')",
      },
      componentConfig: {
        description: "Configuration object for the interactive component (JSON)",
      },
      componentAnswer: {
        description: "Expected answer for interactive component (JSON)",
      },
    },
    required: ["interactionId", "question", "type"],
  },
};
