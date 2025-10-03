/**
 * @file Brainloop-centric tool handlers
 * @module handlers/tools/brainloop-handlers
 *
 * @remarks
 * These handlers implement the brainloop-centric API where users can:
 * - "Create a brainloop about X" - Creates complete learning experience
 * - "View my brainloops" - See all learning paths
 * - "Expand brainloop" - Add more content
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
 * Create a complete brainloop (course with units and lessons)
 * This is the main "create a brainloop about X" tool
 */
export async function handleCreateBrainloop(
  args: {
    title: string;
    description: string;
    topics: string[];
    isPublic?: boolean;
    isPublished?: boolean;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🧠 Creating brainloop: "${args.title}" for user ${context.userId}`);

    // Step 1: Create the brainloop (course)
    const [course] = await context.brainloopService.createCoursesBatch([{
      title: args.title,
      description: args.description,
      isPrivate: !(args.isPublic ?? false),
    }]);

    logger.info(`✅ Brainloop created with ID: ${course.id}`);

    // Step 2: Create units for each topic
    const units = await context.brainloopService.createUnitsBatch(
      course.id,
      args.topics.map((topic, index) => ({
        title: topic,
        description: `Learn about ${topic}`,
        order: index + 1,
      }))
    );

    logger.info(`✅ Created ${units.length} units for brainloop`);

    return {
      content: [{
        type: 'text',
        text: `🎉 **Brainloop Created Successfully!**\n\n` +
          `**${course.title}**\n` +
          `${course.description}\n\n` +
          `**Brainloop ID:** ${course.id}\n` +
          `**Visibility:** ${!course.isPrivate ? '🌍 Public' : '🔒 Private'}\n\n` +
          `**Learning Path (${units.length} topics):**\n` +
          units.map((unit, i) => `${i + 1}. ${unit.title} (Unit ID: ${unit.id})`).join('\n') +
          `\n\n💡 **Next steps:** You can now expand this brainloop by adding lessons to each unit using \`expand_brainloop\`.`
      }]
    };
  } catch (error) {
    logger.error('Failed to create brainloop', { error, title: args.title });
    throw new Error(`Failed to create brainloop: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * View all user's brainloops
 */
export async function handleViewBrainloops(
  _args: any,
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📚 Viewing brainloops for user ${context.userId}`);
    const courses = await context.brainloopService.getMyCourses();

    return {
      content: [{
        type: 'text',
        text: `🧠 **Your Brainloops** (${courses.length} total)\n\n` +
          (courses.length === 0
            ? `No brainloops yet. Create one with \`create_brainloop\`!`
            : courses.map(course =>
              `**${course.title}**\n` +
              `  📝 ${course.description}\n` +
              `  🆔 ID: ${course.id}\n` +
              `  ${!course.isPrivate ? '🌍 Public' : '🔒 Private'}\n` +
              (course._count ? `  📊 ${course._count.units} units • ${course._count.enrollments} learners\n` : '') +
              `  👤 By: ${course.user.name}\n`
            ).join('\n'))
      }]
    };
  } catch (error) {
    logger.error('Failed to view brainloops', { error, userId: context.userId });
    throw new Error(`Failed to view brainloops: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get detailed brainloop information
 */
export async function handleGetBrainloop(
  args: { brainloopId: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🔍 Getting brainloop details: ${args.brainloopId}`);
    const course = await context.brainloopService.getCourse(args.brainloopId);
    const units = await context.brainloopService.getCourseUnits(args.brainloopId);

    return {
      content: [{
        type: 'text',
        text: `🧠 **${course.title}**\n\n` +
          `📝 ${course.description}\n\n` +
          `**Details:**\n` +
          `• Brainloop ID: ${course.id}\n` +
          `• Visibility: ${!course.isPrivate ? '🌍 Public' : '🔒 Private'}\n` +
          `• Created: ${new Date(course.createdAt).toLocaleDateString()}\n` +
          `• Author: ${course.user.name} (${course.user.email})\n\n` +
          `**Learning Path (${units.length} units):**\n` +
          units.map(unit =>
            `${unit.order}. **${unit.title}**\n` +
            `   ${unit.description || 'No description'}\n` +
            `   Unit ID: ${unit.id}\n` +
            (unit._count ? `   ${unit._count.lessons} lessons\n` : '')
          ).join('\n')
      }]
    };
  } catch (error) {
    logger.error('Failed to get brainloop', { error, brainloopId: args.brainloopId });
    throw new Error(`Failed to get brainloop: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Expand brainloop with more content
 */
export async function handleExpandBrainloop(
  args: {
    brainloopId: string;
    units: Array<{
      title: string;
      description: string;
      lessons: Array<{ title: string; content: string }>;
    }>;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🔧 Expanding brainloop ${args.brainloopId} with ${args.units.length} units`);

    const results = [];

    for (const unitData of args.units) {
      // Create the unit
      const [unit] = await context.brainloopService.createUnitsBatch(args.brainloopId, [{
        title: unitData.title,
        description: unitData.description,
        order: 999, // Will be reordered by API
      }]);

      // Create lessons for the unit
      const lessons = await context.brainloopService.createLessonsBatch(
        unit.id,
        unitData.lessons.map((lesson, index) => ({
          title: lesson.title,
          content: lesson.content,
          order: index + 1,
        }))
      );

      results.push({ unit, lessons });
    }

    return {
      content: [{
        type: 'text',
        text: `🎉 **Brainloop Expanded Successfully!**\n\n` +
          `Added ${results.length} new units to brainloop ${args.brainloopId}:\n\n` +
          results.map(({ unit, lessons }) =>
            `**${unit.title}**\n` +
            `  Unit ID: ${unit.id}\n` +
            `  Lessons: ${lessons.length}\n` +
            lessons.map((l, i) => `  ${i + 1}. ${l.title} (ID: ${l.id})`).join('\n')
          ).join('\n\n') +
          `\n\n💡 **Next steps:** You can now create interactions and add questions to these lessons using their IDs.`
      }]
    };
  } catch (error) {
    logger.error('Failed to expand brainloop', { error, brainloopId: args.brainloopId });
    throw new Error(`Failed to expand brainloop: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Track brainloop progress
 */
export async function handleBrainloopProgress(
  args: { brainloopId?: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📊 Getting brainloop progress for user ${context.userId}`);
    const progress = args.brainloopId
      ? await context.brainloopService.getCourseProgress(args.brainloopId)
      : await context.brainloopService.getProgress();

    const completed = progress.filter(p => p.isCompleted);
    const completionRate = progress.length > 0
      ? ((completed.length / progress.length) * 100).toFixed(1)
      : '0';

    return {
      content: [{
        type: 'text',
        text: `📊 **Brainloop Progress**\n\n` +
          `**Overall:** ${completionRate}% complete (${completed.length}/${progress.length} lessons)\n\n` +
          (completed.length > 0
            ? `**Completed Lessons:**\n` +
            completed.map(p =>
              `✅ ${p.lesson.title}\n` +
              `   🧠 ${p.lesson.unit.course.title} → ${p.lesson.unit.title}\n` +
              `   📅 ${p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'N/A'}\n`
            ).join('\n')
            : '') +
          (progress.length > completed.length
            ? `\n**In Progress:**\n` +
            progress.filter(p => !p.isCompleted).map(p =>
              `⏳ ${p.lesson.title}\n` +
              `   🧠 ${p.lesson.unit.course.title} → ${p.lesson.unit.title}\n`
            ).join('\n')
            : '')
      }]
    };
  } catch (error) {
    logger.error('Failed to get brainloop progress', { error, userId: context.userId });
    throw new Error(`Failed to get brainloop progress: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create an interaction for a lesson
 */
export async function handleCreateInteraction(
  args: { lessonId: string; type?: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`🎯 Creating interaction for lesson ${args.lessonId}`);
    const result = await context.brainloopService.createInteraction(args.lessonId);

    return {
      content: [{
        type: 'text',
        text: `✅ **Interaction Created Successfully!**\n\n` +
          `**Interaction ID:** ${result.id}\n` +
          `**Lesson ID:** ${result.lessonId}\n` +
          `**Type:** ${result.type}\n\n` +
          `💡 You can now add prompts (questions/exercises) to this interaction using \`create_prompt\` or \`create_prompts_batch\`.`
      }]
    };
  } catch (error) {
    logger.error('Failed to create interaction', { error, lessonId: args.lessonId });
    throw new Error(`Failed to create interaction: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a single prompt for an interaction
 */
export async function handleCreatePrompt(
  args: {
    interactionId: string;
    question: string;
    type: string;
    options?: string[];
    answer?: any;
    explanation?: string;
    codeLanguage?: string;
    codeStarterCode?: string;
    codeExpectedOutput?: string;
    codeTestCases?: any;
    codeTimeLimit?: number;
    codeMemoryLimit?: number;
    componentType?: string;
    componentConfig?: any;
    componentAnswer?: any;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📝 Creating prompt for interaction ${args.interactionId}`);
    const result = await context.brainloopService.createPrompt(args);

    return {
      content: [{
        type: 'text',
        text: `✅ **Prompt Created Successfully!**\n\n` +
          `**Prompt ID:** ${result.prompt.id}\n` +
          `**Question:** ${result.prompt.question}\n` +
          `**Type:** ${result.prompt.type}\n` +
          `**Interaction ID:** ${result.prompt.interactionId}\n\n` +
          `📊 **Lesson now has ${result.lesson.promptCount} prompt(s)**`
      }]
    };
  } catch (error) {
    logger.error('Failed to create prompt', { error, interactionId: args.interactionId });
    throw new Error(`Failed to create prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create multiple prompts for an interaction
 */
export async function handleCreatePromptsBatch(
  args: {
    interactionId: string;
    prompts: Array<{
      question: string;
      type: string;
      options?: string[];
      answer?: any;
      explanation?: string;
      codeLanguage?: string;
      codeStarterCode?: string;
      componentType?: string;
      componentConfig?: any;
    }>;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📝 Creating ${args.prompts.length} prompts for interaction ${args.interactionId}`);
    const result = await context.brainloopService.createPromptsBatch(args.interactionId, args.prompts);

    return {
      content: [{
        type: 'text',
        text: `✅ **${result.metadata.totalCreated} Prompts Created Successfully!**\n\n` +
          `**Interaction ID:** ${result.interaction.id}\n` +
          `**Lesson:** ${result.lesson.title}\n` +
          `**Total Prompts Now:** ${result.metadata.totalPromptsNow}\n\n` +
          `**Created Prompts:**\n` +
          result.prompts.map((p: any, i: number) =>
            `${i + 1}. ${p.question.substring(0, 60)}${p.question.length > 60 ? '...' : ''} (${p.type})`
          ).join('\n')
      }]
    };
  } catch (error) {
    logger.error('Failed to create prompts batch', { error, interactionId: args.interactionId });
    throw new Error(`Failed to create prompts batch: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get all prompts for a lesson
 */
export async function handleGetLessonPrompts(
  args: { lessonId: string },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`📚 Getting prompts for lesson ${args.lessonId}`);
    const result = await context.brainloopService.getLessonPrompts(args.lessonId);

    if (result.metadata.totalPrompts === 0) {
      return {
        content: [{
          type: 'text',
          text: `📭 **No prompts found for this lesson**\n\n` +
            `**Lesson:** ${result.lesson.title}\n` +
            `**Has Interaction:** ${result.lesson.hasInteraction ? 'Yes' : 'No'}\n\n` +
            (result.metadata.needsInteraction
              ? `💡 Create an interaction first with \`create_interaction\``
              : `💡 Add prompts with \`create_prompt\` or \`create_prompts_batch\``)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: `📚 **Lesson Prompts** (${result.metadata.totalPrompts} total)\n\n` +
          `**Lesson:** ${result.lesson.title}\n` +
          `**Interaction ID:** ${result.interaction.id}\n\n` +
          `**Prompts:**\n` +
          result.prompts.map((p: any, i: number) =>
            `${i + 1}. **${p.question}**\n` +
            `   Type: ${p.type}\n` +
            `   ID: ${p.id}\n` +
            (p.options ? `   Options: ${p.options.length}\n` : '') +
            (p.explanation ? `   Has explanation: Yes\n` : '')
          ).join('\n')
      }]
    };
  } catch (error) {
    logger.error('Failed to get lesson prompts', { error, lessonId: args.lessonId });
    throw new Error(`Failed to get lesson prompts: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update an existing lesson
 */
export async function handleUpdateLesson(
  args: {
    lessonId: string;
    title?: string;
    content?: string;
    videoUrl?: string;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`✏️ Updating lesson ${args.lessonId}`);
    const result = await context.brainloopService.updateLesson(args.lessonId, {
      title: args.title,
      content: args.content,
      videoUrl: args.videoUrl,
    });

    return {
      content: [{
        type: 'text',
        text: `✅ **Lesson Updated Successfully!**\n\n` +
          `**Lesson ID:** ${result.lesson.id}\n` +
          `**Title:** ${result.lesson.title}\n` +
          `**Content Length:** ${result.lesson.content?.length || 0} characters\n` +
          (result.lesson.videoUrl ? `**Video:** ${result.lesson.videoUrl}\n` : '') +
          `**Last Updated:** ${new Date(result.lesson.updatedAt).toLocaleString()}\n\n` +
          `💡 Changes saved successfully. The lesson content has been updated.`
      }]
    };
  } catch (error) {
    logger.error('Failed to update lesson', { error, lessonId: args.lessonId });
    throw new Error(`Failed to update lesson: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update an existing unit
 */
export async function handleUpdateUnit(
  args: {
    unitId: string;
    title?: string;
    description?: string;
  },
  context: BrainloopToolContext
): Promise<CallToolResult> {
  try {
    logger.info(`✏️ Updating unit ${args.unitId}`);
    const result = await context.brainloopService.updateUnit(args.unitId, {
      title: args.title,
      description: args.description,
    });

    return {
      content: [{
        type: 'text',
        text: `✅ **Unit Updated Successfully!**\n\n` +
          `**Unit ID:** ${result.unit.id}\n` +
          `**Title:** ${result.unit.title}\n` +
          `**Description:** ${result.unit.description}\n` +
          `**Lesson Count:** ${result.unit._count?.lessons || 0}\n` +
          `**Last Updated:** ${new Date(result.unit.updatedAt).toLocaleString()}\n\n` +
          `💡 Changes saved successfully. The unit details have been updated.`
      }]
    };
  } catch (error) {
    logger.error('Failed to update unit', { error, unitId: args.unitId });
    throw new Error(`Failed to update unit: ${error instanceof Error ? error.message : String(error)}`);
  }
}
