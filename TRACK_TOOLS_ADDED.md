# BrainTrack Tools Added

This document describes the new BrainTrack tools added to the MCP server.

## Overview

BrainTrack tools enable management of learning paths (tracks) - curated collections of courses organized around specific learning goals.

## New Tools Added

### 1. `create_track`
Create a new BrainTrack with title, description, and optional icon/hero image.

**Parameters:**
- `title` (required): Track title
- `description` (required): Learning path description
- `icon` (optional): Emoji icon
- `hero` (optional): Hero image URL
- `isPrivate` (optional): Privacy setting (default: true)
- `slug` (optional): URL-friendly slug

### 2. `view_tracks`
View all accessible tracks (owned, public, or enrolled).

**Parameters:** None

### 3. `get_track`
Get detailed information about a specific track, including all courses.

**Parameters:**
- `trackId` (required): The track ID

### 4. `add_course_to_track`
Add a course to a track (owner only).

**Parameters:**
- `trackId` (required): The track ID
- `courseId` (required): The course ID to add

### 5. `enroll_in_track`
Enroll in a track and all its courses.

**Parameters:**
- `trackId` (required): The track ID to enroll in

## Files Added/Modified

### New Files:
- `src/constants/tool/create-track.ts` - Tool definition
- `src/constants/tool/view-tracks.ts` - Tool definition
- `src/constants/tool/get-track.ts` - Tool definition
- `src/constants/tool/add-course-to-track.ts` - Tool definition
- `src/constants/tool/enroll-in-track.ts` - Tool definition
- `src/handlers/tools/track-handlers.ts` - Track tool handlers

### Modified Files:
- `src/constants/tools.ts` - Added track tool imports and registration
- `src/handlers/tool-handlers.ts` - Added track tool schemas and case statements
- `src/handlers/tools/index.ts` - Added track handler exports

## Service Methods Required

**IMPORTANT:** These handlers call methods on `BrainloopService` that need to be implemented:

```typescript
// Required methods in BrainloopService:
createTrack(data: CreateTrackData): Promise<Track>
getTracks(): Promise<Track[]>
getTrack(trackId: string): Promise<TrackDetails>
addCourseToTrack(trackId: string, courseId: string): Promise<AddCourseResult>
enrollInTrack(trackId: string): Promise<EnrollmentResult>
```

## API Endpoints Used

These tools make requests to the following BrainLoop API endpoints:
- `POST /api/tracks` - Create track
- `GET /api/tracks` - List tracks
- `GET /api/tracks/[trackId]` - Get track details
- `POST /api/tracks/[trackId]/courses` - Add course to track
- `POST /api/tracks/[trackId]/enroll` - Enroll in track

## Testing

To test these tools, ensure:
1. BrainLoop API endpoints are available
2. Service methods are implemented in `BrainloopService`
3. User authentication is working
4. Track creation permissions are correct

## Next Steps

1. Implement the service methods in `BrainloopService`
2. Add TypeScript types for track data structures
3. Test all track tools with the MCP server
4. Update server documentation with track tool examples
