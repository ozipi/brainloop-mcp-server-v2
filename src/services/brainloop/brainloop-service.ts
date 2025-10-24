/**
 * @file BRAINLOOP API service for MCP server
 * @module services/brainloop/brainloop-service
 *
 * @remarks
 * This service provides authenticated access to the BRAINLOOP API for
 * course management, progress tracking, and user interactions.
 */

import { logger } from '../../utils/logger.js';
import { CONFIG } from '../../server/config.js';

export interface BrainloopUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  createdAt: string;
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  _count?: {
    units: number;
    enrollments: number;
  };
}

export interface Unit {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    lessons: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  unitId: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  lesson: {
    title: string;
    unit: {
      title: string;
      course: {
        title: string;
      };
    };
  };
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  course: Course;
}

export interface Track {
  id: string;
  title: string;
  description: string;
  icon?: string;
  hero?: string;
  slug: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  _count?: {
    trackCourses: number;
    enrollments: number;
  };
  trackCourses?: TrackCourse[];
  isOwner?: boolean;
  isEnrolled?: boolean;
}

export interface TrackCourse {
  id: string;
  trackId: string;
  courseId: string;
  order: number;
  createdAt: string;
  course: Course;
}

export interface TrackEnrollment {
  id: string;
  userId: string;
  trackId: string;
  enrolledAt: string;
  track: Track;
}

/**
 * Configuration for BRAINLOOP service authentication
 */
interface BrainloopAuthConfig {
  /** User's BRAINLOOP access token */
  accessToken: string;
  /** User ID for API requests */
  userId: string;
  /** Optional callback to refresh access token when it expires */
  refreshTokenCallback?: () => Promise<string>;
}

/**
 * BRAINLOOP API service with authentication support
 */
export class BrainloopService {
  private readonly baseUrl: string;
  private accessToken: string;
  private readonly userId: string;
  private readonly refreshTokenCallback?: () => Promise<string>;

  constructor(config: BrainloopAuthConfig) {
    this.baseUrl = CONFIG.BRAINLOOP_API_URL;
    this.accessToken = config.accessToken;
    this.userId = config.userId;
    this.refreshTokenCallback = config.refreshTokenCallback;

    // Log initialization for debugging
    logger.debug(`Initialized BRAINLOOP service for user: ${this.userId}`);
  }

  /**
   * Make authenticated request to BRAINLOOP API with automatic token refresh
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      logger.info(`🌐 [API REQUEST] ${options.method || 'GET'} ${endpoint}`, {
        userId: this.userId,
        url,
        hasBody: !!options.body
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !isRetry && this.refreshTokenCallback) {
        const errorText = await response.text();

        // Check if it's a token expiration error
        if (errorText.includes('Invalid access token') || errorText.includes('expired')) {
          logger.info('Access token expired, attempting refresh', { userId: this.userId });

          try {
            // Refresh the token using the callback
            const newAccessToken = await this.refreshTokenCallback();
            this.accessToken = newAccessToken;

            logger.info('Access token refreshed successfully', { userId: this.userId });

            // Retry the request with the new token (pass isRetry=true to prevent infinite loop)
            return await this.makeRequest<T>(endpoint, options, true);
          } catch (refreshError) {
            logger.error('Failed to refresh access token', {
              userId: this.userId,
              error: refreshError instanceof Error ? refreshError.message : String(refreshError),
            });
            throw new Error('Authentication failed: Unable to refresh access token');
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`❌ [API ERROR] ${response.status} ${response.statusText}`, {
          url,
          endpoint,
          status: response.status,
          error: errorText.substring(0, 500),
          userId: this.userId
        });
        throw new Error(`BRAINLOOP API error: ${response.status} ${response.statusText}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json() as T;
      logger.info(`✅ [API SUCCESS] ${options.method || 'GET'} ${endpoint}`, {
        userId: this.userId,
        hasData: !!data
      });
      return data;
    } catch (error) {
      logger.error(`❌ [API EXCEPTION] ${endpoint}`, {
        url,
        userId: this.userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Get user's enrolled courses
   */
  async getMyCourses(): Promise<Course[]> {
    return this.makeRequest<Course[]>('/mcp/courses/my-courses');
  }

  /**
   * Get public courses
   */
  async getPublicCourses(): Promise<Course[]> {
    return this.makeRequest<Course[]>('/mcp/courses?public=true');
  }

  /**
   * Get course details by ID
   */
  async getCourse(courseId: string): Promise<Course> {
    return this.makeRequest<Course>(`/mcp/courses/${courseId}`);
  }

  /**
   * Get course units
   */
  async getCourseUnits(courseId: string): Promise<Unit[]> {
    return this.makeRequest<Unit[]>(`/mcp/courses/${courseId}/units`);
  }

  /**
   * Get unit lessons
   */
  async getUnitLessons(unitId: string): Promise<Lesson[]> {
    return this.makeRequest<Lesson[]>(`/mcp/units/${unitId}/lessons`);
  }

  /**
   * Get specific lesson
   */
  async getLesson(lessonId: string): Promise<Lesson> {
    return this.makeRequest<Lesson>(`/mcp/lessons/${lessonId}`);
  }

  /**
   * Get user's progress
   */
  async getProgress(): Promise<Progress[]> {
    return this.makeRequest<Progress[]>('/mcp/progress');
  }

  /**
   * Get course progress for user
   */
  async getCourseProgress(courseId: string): Promise<Progress[]> {
    return this.makeRequest<Progress[]>(`/mcp/courses/${courseId}/progress`);
  }

  /**
   * Mark lesson as complete
   */
  async completeLesson(lessonId: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/mcp/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  }

  /**
   * Enroll in course
   */
  async enrollInCourse(courseId: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(`/mcp/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  /**
   * Search lessons
   */
  async searchLessons(query: string): Promise<Lesson[]> {
    return this.makeRequest<Lesson[]>(`/mcp/lessons/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<BrainloopUser> {
    return this.makeRequest<BrainloopUser>('/mcp/user/profile');
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(): Promise<{
    totalLessonsCompleted: number;
    totalCoursesEnrolled: number;
    totalTimeSpent: number;
    streakDays: number;
  }> {
    return this.makeRequest('/mcp/user/analytics');
  }

  /**
   * Create multiple courses in batch
   */
  async createCoursesBatch(courses: Array<{
    title: string;
    description: string;
    isPrivate?: boolean;
  }>): Promise<Course[]> {
    return this.makeRequest<Course[]>('/mcp/courses/batch', {
      method: 'POST',
      body: JSON.stringify(courses),
    });
  }

  /**
   * Create multiple units in batch
   */
  async createUnitsBatch(courseId: string, units: Array<{
    title: string;
    description: string;
    order: number;
  }>): Promise<Unit[]> {
    return this.makeRequest<Unit[]>(`/mcp/courses/${courseId}/units/batch`, {
      method: 'POST',
      body: JSON.stringify(units),
    });
  }

  /**
   * Create multiple lessons in batch
   */
  async createLessonsBatch(unitId: string, lessons: Array<{
    title: string;
    content: string;
    order: number;
    videoUrl?: string;
  }>): Promise<Lesson[]> {
    return this.makeRequest<Lesson[]>(`/mcp/units/${unitId}/lessons/batch`, {
      method: 'POST',
      body: JSON.stringify(lessons),
    });
  }

  /**
   * Create an interaction for a lesson
   */
  async createInteraction(lessonId: string): Promise<{ id: string; lessonId: string; type: string }> {
    const response = await this.makeRequest<any>(`/mcp/lessons/${lessonId}/interaction`, {
      method: 'POST',
    });
    // API returns nested interaction object, extract it
    return response.interaction || response;
  }

  /**
   * Create a single prompt for an interaction
   */
  async createPrompt(promptData: {
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
  }): Promise<any> {
    return this.makeRequest<any>('/mcp/prompts', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  }

  /**
   * Create multiple prompts in batch
   */
  async createPromptsBatch(interactionId: string, prompts: Array<{
    question: string;
    type: string;
    options?: string[];
    answer?: any;
    explanation?: string;
    codeLanguage?: string;
    codeStarterCode?: string;
    componentType?: string;
    componentConfig?: any;
  }>): Promise<any> {
    return this.makeRequest<any>('/mcp/prompts/batch', {
      method: 'POST',
      body: JSON.stringify({
        interactionId,
        prompts,
      }),
    });
  }

  /**
   * Get all prompts for a lesson
   */
  async getLessonPrompts(lessonId: string): Promise<any> {
    return this.makeRequest<any>(`/mcp/lessons/${lessonId}/prompts`);
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: string, data: {
    title?: string;
    content?: string;
    videoUrl?: string;
  }): Promise<any> {
    return this.makeRequest<any>(`/mcp/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing unit
   */
  async updateUnit(unitId: string, data: {
    title?: string;
    description?: string;
  }): Promise<any> {
    return this.makeRequest<any>(`/mcp/units/${unitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Detect duplicate units and empty lessons in a course
   */
  async detectDuplicates(courseId: string): Promise<any> {
    return this.makeRequest<any>(`/mcp/courses/${courseId}/duplicates`);
  }

  /**
   * Clean up empty units from a course
   */
  async cleanupEmptyContent(courseId: string, dryRun: boolean = false): Promise<any> {
    return this.makeRequest<any>(`/mcp/courses/${courseId}/cleanup`, {
      method: 'POST',
      body: JSON.stringify({ dryRun }),
    });
  }

  /**
   * Reorder units in a course
   */
  async reorderUnits(courseId: string, unitIds: string[]): Promise<any> {
    return this.makeRequest<any>(`/mcp/courses/${courseId}/reorder-units`, {
      method: 'PUT',
      body: JSON.stringify({ unitIds }),
    });
  }

  /**
   * Create a new track
   */
  async createTrack(data: {
    title: string;
    description: string;
    icon?: string;
    hero?: string;
    isPrivate?: boolean;
    slug?: string;
  }): Promise<Track> {
    return this.makeRequest<Track>('/mcp/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all tracks for the user
   */
  async getTracks(): Promise<Track[]> {
    return this.makeRequest<Track[]>('/mcp/tracks');
  }

  /**
   * Get a specific track by ID
   */
  async getTrack(trackId: string): Promise<Track> {
    return this.makeRequest<Track>(`/mcp/tracks/${trackId}`);
  }

  /**
   * Add a course to a track
   */
  async addCourseToTrack(trackId: string, courseId: string): Promise<{
    trackCourse: TrackCourse;
    track: Track;
  }> {
    return this.makeRequest<{
      trackCourse: TrackCourse;
      track: Track;
    }>(`/mcp/tracks/${trackId}/courses`, {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  /**
   * Enroll in a track
   */
  async enrollInTrack(trackId: string): Promise<{
    track: Track;
    message: string;
  }> {
    return this.makeRequest<{
      track: Track;
      message: string;
    }>(`/mcp/tracks/${trackId}/enroll`, {
      method: 'POST',
    });
  }
}
