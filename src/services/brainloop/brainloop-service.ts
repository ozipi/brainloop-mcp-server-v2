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

/**
 * Configuration for BRAINLOOP service authentication
 */
interface BrainloopAuthConfig {
  /** User's BRAINLOOP access token */
  accessToken: string;
  /** User ID for API requests */
  userId: string;
}

/**
 * BRAINLOOP API service with authentication support
 */
export class BrainloopService {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly userId: string;

  constructor(config: BrainloopAuthConfig) {
    this.baseUrl = CONFIG.BRAINLOOP_API_URL;
    this.accessToken = config.accessToken;
    this.userId = config.userId;

    // Log initialization for debugging
    logger.debug(`Initialized BRAINLOOP service for user: ${this.userId}`);
  }

  /**
   * Make authenticated request to BRAINLOOP API
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      logger.debug(`Making BRAINLOOP API request: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`BRAINLOOP API error: ${response.status} ${response.statusText}`, {
          url,
          status: response.status,
          error: errorText,
        });
        throw new Error(`BRAINLOOP API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      logger.error('BRAINLOOP API request failed', {
        url,
        error: error instanceof Error ? error.message : String(error),
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
    isPublic?: boolean;
    isPublished?: boolean;
  }>): Promise<Course[]> {
    return this.makeRequest<Course[]>('/mcp/courses/batch', {
      method: 'POST',
      body: JSON.stringify({ courses }),
    });
  }

  /**
   * Create multiple units in batch
   */
  async createUnitsBatch(courseId: string, units: Array<{
    title: string;
    description: string;
    order: number;
    isPublished?: boolean;
    dependencies?: string[];
  }>): Promise<Unit[]> {
    return this.makeRequest<Unit[]>(`/mcp/courses/${courseId}/units/batch`, {
      method: 'POST',
      body: JSON.stringify({ units }),
    });
  }

  /**
   * Create multiple lessons in batch
   */
  async createLessonsBatch(unitId: string, lessons: Array<{
    title: string;
    content: string;
    order: number;
    isPublished?: boolean;
    videoUrl?: string;
    estimatedDuration?: number;
  }>): Promise<Lesson[]> {
    return this.makeRequest<Lesson[]>(`/mcp/units/${unitId}/lessons/batch`, {
      method: 'POST',
      body: JSON.stringify({ lessons }),
    });
  }
}
