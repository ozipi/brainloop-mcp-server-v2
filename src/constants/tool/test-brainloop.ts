/**
 * Test BRAINLOOP tool to verify connection
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const testBrainloop: Tool = {
  name: "test_brainloop",
  description: "Test tool to verify BRAINLOOP MCP server is connected and working",
  inputSchema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Test message to echo back",
      },
    },
    required: ["message"],
  },
};
