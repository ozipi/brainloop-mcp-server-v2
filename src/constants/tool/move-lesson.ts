import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const moveLesson: Tool = {
  name: "move_lesson",
  description: "Move a lesson from its current unit to a different unit. Use this to reorganize lessons within a brainloop. The lesson will be moved to the target unit, and you can optionally specify its position (order) in the new unit. If no order is specified, the lesson will be appended to the end of the target unit.",
  inputSchema: {
    type: "object",
    properties: {
      lessonId: {
        type: "string",
        description: "The ID of the lesson to move"
      },
      targetUnitId: {
        type: "string",
        description: "The ID of the target unit where the lesson should be moved"
      },
      newOrder: {
        type: "number",
        description: "Optional new order position in the target unit (0-based). If not specified, the lesson will be appended to the end."
      }
    },
    required: ["lessonId", "targetUnitId"]
  }
};

