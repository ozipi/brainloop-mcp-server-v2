/**
 * @file BrainTrack tool handlers
 * @module handlers/tools/track-handlers
 *
 * @remarks
 * These handlers implement track (learning path) management where users can:
 * - Create tracks (collections of courses)
 * - View their tracks
 * - Add courses to tracks
 * - Enroll in tracks
 */

import { logger } from '../../utils/logger.js';
import type { BrainloopService } from '../../services/brainloop/brainloop-service.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface BrainloopToolContext {
  brainloopService: BrainloopService;
  userId: string;
  sessionId: string;
}

/**
 * Create a new BrainTrack (collection of courses)
 */
export async function handleCreateTrack(
  args: {
    title: string;
    description: string;
    icon?: string;
    hero?: string;
    isPrivate?: boolean;
    slug?: string;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🎯 Creating track: "${args.title}" for user ${context.userId}`);

    const track = await context.brainloopService.createTrack({
      title: args.title,
      description: args.description,
      icon: args.icon,
      hero: args.hero,
      isPrivate: args.isPrivate ?? true,
      slug: args.slug,
    });

    logger.info(`✅ Track created with ID: ${track.id}`);

    return {
      content: [{
        type: 'text',
        text: `🎉 **Track Created Successfully!**\n\n` +
          `**${track.title}**\n` +
          `${track.description}\n\n` +
          `**Track ID:** ${track.id}\n` +
          `**Slug:** ${track.slug}\n` +
          `**Visibility:** ${track.isPrivate ? '🔒 Private' : '🌍 Public'}\n` +
          (track.icon ? `**Icon:** ${track.icon}\n` : '') +
          `\n💡 **Next steps:** Add courses to this track using \`add_course_to_track\`.`
      }]
    };
  } catch (error) {
    logger.error('Failed to create track', { error, title: args.title });
    throw new Error(`Failed to create track: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * View all user's tracks
 */
export async function handleViewTracks(
  _args: any,
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📚 Viewing tracks for user ${context.userId}`);
    const tracks = await context.brainloopService.getTracks();

    return {
      content: [{
        type: 'text',
        text: `🎯 **Your BrainTracks** (${tracks.length} total)\n\n` +
          (tracks.length === 0
            ? `No tracks yet. Create one with \`create_track\`!`
            : tracks.map(track =>
              `${track.icon || '🎯'} **${track.title}**\n` +
              `  📝 ${track.description}\n` +
              `  🆔 ID: ${track.id}\n` +
              `  📚 Courses: ${track._count?.trackCourses || 0}\n` +
              `  👥 Learners: ${track._count?.enrollments || 0}\n` +
              `  ${track.isPrivate ? '🔒 Private' : '🌍 Public'}${track.isOwner ? ' • 👑 Owner' : ''}${track.isEnrolled ? ' • ✅ Enrolled' : ''}\n`
            ).join('\n'))
      }]
    };
  } catch (error) {
    logger.error('Failed to view tracks', { error });
    throw new Error(`Failed to view tracks: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get detailed information about a track
 */
export async function handleGetTrack(
  args: { trackId: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🔍 Getting track ${args.trackId} for user ${context.userId}`);
    const track = await context.brainloopService.getTrack(args.trackId);

    let responseText = `${track.icon || '🎯'} **${track.title}**\n\n`;
    responseText += `📝 ${track.description}\n\n`;
    responseText += `**Track Details:**\n`;
    responseText += `  🆔 ID: ${track.id}\n`;
    responseText += `  🔗 Slug: ${track.slug}\n`;
    responseText += `  ${track.isPrivate ? '🔒 Private' : '🌍 Public'}\n`;
    responseText += `  👤 Created by: ${track.user.name || track.user.email}\n`;
    responseText += `  👥 Learners: ${track._count.enrollments}\n`;
    responseText += `  ${track.isOwner ? '👑 You own this track\n' : ''}`;
    responseText += `  ${track.isEnrolled ? '✅ You are enrolled\n' : ''}\n`;

    if (track.trackCourses.length > 0) {
      responseText += `**Learning Path (${track.trackCourses.length} courses):**\n\n`;
      track.trackCourses.forEach((tc, index) => {
        responseText += `${index + 1}. ${tc.course.icon || '📚'} **${tc.course.title}**\n`;
        responseText += `   ${tc.course.description}\n`;
        responseText += `   Course ID: ${tc.course.id}\n\n`;
      });
    } else {
      responseText += `**No courses yet.** Add courses using \`add_course_to_track\`.`;
    }

    return {
      content: [{
        type: 'text',
        text: responseText
      }]
    };
  } catch (error) {
    logger.error('Failed to get track', { error, trackId: args.trackId });
    throw new Error(`Failed to get track: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Add a course to a track
 */
export async function handleAddCourseToTrack(
  args: { trackId: string; courseId: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`➕ Adding course ${args.courseId} to track ${args.trackId}`);
    const result = await context.brainloopService.addCourseToTrack(args.trackId, args.courseId);

    return {
      content: [{
        type: 'text',
        text: `✅ **Course Added to Track!**\n\n` +
          `**Course:** ${result.trackCourse.course.title}\n` +
          `**Track:** ${result.track.title}\n` +
          `**Position:** #${result.trackCourse.order}\n\n` +
          `This course is now part of the learning path!`
      }]
    };
  } catch (error) {
    logger.error('Failed to add course to track', { error, trackId: args.trackId, courseId: args.courseId });
    throw new Error(`Failed to add course to track: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Enroll in a track
 */
export async function handleEnrollInTrack(
  args: { trackId: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📝 Enrolling user ${context.userId} in track ${args.trackId}`);
    const result = await context.brainloopService.enrollInTrack(args.trackId);

    return {
      content: [{
        type: 'text',
        text: `🎉 **Successfully Enrolled in Track!**\n\n` +
          `**Track:** ${result.track.title}\n` +
          `**Courses:** ${result.track._count.trackCourses}\n\n` +
          `✅ You are now enrolled in all ${result.track._count.trackCourses} courses in this track!\n\n` +
          result.message
      }]
    };
  } catch (error) {
    logger.error('Failed to enroll in track', { error, trackId: args.trackId });
    throw new Error(`Failed to enroll in track: ${error instanceof Error ? error.message : String(error)}`);
  }
}
