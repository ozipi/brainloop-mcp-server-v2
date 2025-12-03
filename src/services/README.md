# Services Directory

This directory contains service implementations that handle external API interactions, data processing, and business logic. Services encapsulate all the complexity of working with external systems, providing clean interfaces for handlers.

## Overview

Services are the "how" of the MCP server:
- How to authenticate with external APIs
- How to make API requests
- How to transform data
- How to handle errors and retries

## Directory Structure

### Core Services

#### `systemprompt-service.ts`
Integration with SystemPrompt.io API:
- Processes sampling callbacks
- Handles API authentication
- Manages request/response flow
- Provides error handling

### Brainloop Services (`/brainloop`)

Comprehensive Brainloop API integration:

#### Core Components
- **`brainloop-service.ts`** - Main service coordinating all Brainloop operations
  - Course management (create, view, get, expand)
  - Unit and lesson operations
  - Progress tracking
  - Interaction and prompt management
  - Track management

## Architecture Patterns

### Singleton Pattern
All services use singleton pattern for global access:
```typescript
class MyService {
  private static instance: MyService;
  
  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
}
```

### Service Pattern
Main service provides all Brainloop operations:
```typescript
class BrainloopService {
  // Provides all Brainloop API operations
  async getMyCourses(): Promise<Course[]>
  async getCourse(courseId: string): Promise<Course>
  async createTrack(data: TrackData): Promise<Track>
  // ... more methods
}
```

## Key Features

### Authentication Management
- OAuth2 flow implementation
- Token storage and refresh
- Session-based authentication
- Automatic retry on auth failure

### API Request Handling
- Rate limiting compliance
- Automatic retries with backoff
- Error transformation
- Response caching where appropriate

### Data Transformation
- Convert Brainloop API responses to internal formats
- Handle API versioning differences
- Normalize data structures
- Type-safe interfaces

## Brainloop Service Details

### BrainloopService
Main entry point providing:
- Course operations (create, view, get, expand)
- Unit and lesson management
- Progress tracking
- Interaction and prompt creation
- Track management and enrollment
- Automatic token refresh on expiration

## Error Handling

Services implement comprehensive error handling:

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error.status === 401) {
    // Handle auth error
    await this.refreshAuth();
    return this.retry();
  } else if (error.status === 429) {
    // Handle rate limit
    await this.waitForRateLimit();
    return this.retry();
  }
  // Transform to user-friendly error
  throw new ServiceError(message, code);
}
```

## Adding New Services

To add a new service:

1. **Create Service Class**
   ```typescript
   export class MyService {
     private static instance: MyService;
     
     public static getInstance(): MyService {
       // Singleton implementation
     }
     
     public async myOperation(): Promise<Result> {
       // Operation implementation
     }
   }
   ```

2. **Implement Error Handling**
   - Define custom error types
   - Transform API errors
   - Add retry logic

3. **Add Authentication**
   - Store credentials
   - Add auth headers
   - Handle refresh

4. **Export Public Interface**
   - Export from index.ts
   - Document methods
   - Provide types

## Testing Services

When testing services:
- Mock external API calls
- Test error scenarios
- Verify retry logic
- Check rate limit handling
- Test auth refresh

This service layer provides a clean separation between the Brainloop API and the MCP protocol implementation.