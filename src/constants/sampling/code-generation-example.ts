/**
 * @file Example sampling prompt for code generation with resource injection
 * @module constants/sampling/code-generation-example
 * 
 * @remarks
 * This module defines an example MCP sampling prompt that demonstrates
 * how resources can be injected into prompts for enhanced code generation.
 */

import type { SamplingPrompt } from '../../types/sampling.js';

/**
 * Example prompt for brainloop creation that uses injected resources.
 *
 * @remarks
 * This prompt demonstrates how the {{resource_*}} placeholders can be used
 * to inject resource content (like guidelines) into the prompt context.
 * The resource injection happens automatically in the prompt handler.
 */
export const CODE_GENERATION_EXAMPLE_PROMPT: SamplingPrompt = {
  name: "brainloop_creation_example",
  description: "Example prompt that demonstrates resource injection for brainloop creation",
  arguments: [
    {
      name: "topic",
      description: "The learning topic to create a brainloop for",
      required: true,
    },
    {
      name: "targetAudience",
      description: "Target audience skill level (beginner, intermediate, advanced)",
      required: false,
    },
  ],
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: "I am an expert learning designer ready to help create engaging brainloops. {{resource_brainloop_creation}}",
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Please help me create a brainloop for the following:

Topic: {{topic}}
Target Audience: {{targetAudience}}

Follow the brainloop creation guidelines and learning design principles that have been provided.`,
      },
    },
  ],
  _meta: {
    callback: "brainloop_creation_callback",
  },
};