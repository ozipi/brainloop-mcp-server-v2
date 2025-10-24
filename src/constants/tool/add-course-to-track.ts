/**
 * Add a course to a track
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const addCourseToTrack: Tool = {
  name: "add_course_to_track",
  description: "Add a course to a BrainTrack. Only track owners can add courses to their tracks. The course will be added to the end of the track unless an order is specified.",
  inputSchema: {
    type: "object",
    properties: {
      trackId: {
        type: "string",
        description: "The ID of the track to add the course to",
      },
      courseId: {
        type: "string",
        description: "The ID of the course to add",
      },
    },
    required: ["trackId", "courseId"],
  },
};
