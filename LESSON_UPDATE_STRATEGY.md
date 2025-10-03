# Lesson Update Strategy - Preventing Empty Duplicates

## Problem
When lesson creation fails (timeout, error, etc.), we end up with:
- Empty units with no lessons
- Empty lessons with no content
- Duplicate units/lessons with similar names
- No way for Claude to fix mistakes without creating more duplicates

## Current Flow Issues
```
1. Create Unit → Success (unit exists in DB)
2. Create Lessons → FAIL (timeout/error)
3. Result: Empty unit left in database
4. Claude retries → Creates ANOTHER empty unit
5. Repeat → Database filled with empty duplicates
```

## Recommended Solution: Idempotent Upsert Pattern

### Strategy
Make lesson/unit creation **idempotent** - safe to call multiple times with same data.

### Implementation

#### 1. Upsert Lessons (Check + Create/Update)
```typescript
// Pseudocode
For each lesson:
  1. Check if lesson exists in unit by exact title match
  2. If exists:
     - If content is empty/minimal → UPDATE with new content
     - If content exists → SKIP (already done)
  3. If not exists:
     - CREATE new lesson
  4. Return lesson ID (whether created or updated)
```

#### 2. Upsert Units (Similar pattern)
```typescript
For each unit:
  1. Check if unit exists in course by exact title match
  2. If exists → Use existing unit ID
  3. If not exists → CREATE new unit
  4. Then proceed with lessons
```

### Benefits
✅ **Retry-safe**: Can retry failed operations without duplicates
✅ **Resume-able**: Can continue from where it failed
✅ **Self-healing**: Empty lessons get filled on retry
✅ **No duplicates**: Same title = same resource
✅ **Simple for Claude**: Just retry the same command

### API Changes Needed

#### New Endpoints:

**1. PUT /api/mcp/lessons/[lessonId]** - Update lesson content
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "videoUrl": "optional"
}
```

**2. PUT /api/mcp/units/[unitId]** - Update unit
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**3. POST /api/mcp/units/[unitId]/lessons/upsert** - Upsert lessons (create or update)
```json
[
  {
    "title": "Lesson Title",  // Used for matching
    "content": "Lesson content",
    "order": 1
  }
]
```

Response includes which were created vs updated:
```json
{
  "lessons": [
    { "id": "abc", "title": "Lesson 1", "action": "created" },
    { "id": "def", "title": "Lesson 2", "action": "updated" },
    { "id": "ghi", "title": "Lesson 3", "action": "skipped" }
  ]
}
```

#### Modified Endpoints:

**POST /api/mcp/courses/[courseId]/units/batch** - Add upsert mode
```json
// Add optional flag
{
  "upsert": true,  // If true, update existing units by title
  "units": [...]
}
```

### MCP Tool Changes

#### New Tool: `update_lesson`
```typescript
{
  name: "update_lesson",
  description: "Update an existing lesson's content. Use this to fix empty lessons or update content.",
  inputSchema: {
    lessonId: string,
    title?: string,
    content?: string,
    videoUrl?: string
  }
}
```

#### Enhanced Tool: `expand_brainloop`
Add `upsertMode` parameter:
```typescript
{
  name: "expand_brainloop",
  inputSchema: {
    brainloopId: string,
    units: [...],
    upsertMode: boolean  // NEW: If true, update existing instead of creating duplicates
  }
}
```

### Duplicate Detection Logic

**For Units:**
```sql
-- Check if unit exists
SELECT id, title, description
FROM Unit
WHERE courseId = ?
  AND title = ?  -- Exact match
```

**For Lessons:**
```sql
-- Check if lesson exists
SELECT id, title, content
FROM Lesson
WHERE unitId = ?
  AND title = ?  -- Exact match
```

**Empty Content Detection:**
```typescript
function isContentEmpty(content: string): boolean {
  return !content ||
         content.trim() === '' ||
         content.length < 10;  // Less than 10 chars = likely empty
}
```

### Workflow Examples

#### Scenario 1: Retry After Failure
```
Attempt 1:
- Create Unit "Python Basics" ✓
- Create Lesson "Intro" → TIMEOUT ✗
- Result: Empty unit in DB

Attempt 2 (with upsert):
- Check Unit "Python Basics" → EXISTS → Use existing ID
- Check Lesson "Intro" → NOT EXISTS → CREATE
- Result: Unit now has content ✓
```

#### Scenario 2: Partial Success
```
Attempt 1:
- Create 3 lessons → First 2 succeed, 3rd fails
- Result: 2 lessons exist, 3rd missing

Attempt 2 (with upsert):
- Lesson 1 → EXISTS with content → SKIP
- Lesson 2 → EXISTS with content → SKIP
- Lesson 3 → NOT EXISTS → CREATE
- Result: All 3 lessons complete ✓
```

#### Scenario 3: Fix Empty Content
```
Current state:
- Lesson exists but content = ""

Update:
- PUT /api/mcp/lessons/[id] with full content
- Result: Lesson updated ✓
```

## Implementation Priority

### Phase 1: Critical (Do First)
1. ✅ PUT /api/mcp/lessons/[lessonId] - Update lesson
2. ✅ PUT /api/mcp/units/[unitId] - Update unit
3. ✅ Add `update_lesson` MCP tool
4. ✅ Add `update_unit` MCP tool

### Phase 2: Important (Do Soon)
5. ⏳ POST /api/mcp/units/[unitId]/lessons/upsert - Upsert lessons
6. ⏳ Add upsert mode to batch endpoints
7. ⏳ Update `expand_brainloop` with upsertMode flag

### Phase 3: Nice to Have
8. ⏳ GET /api/mcp/courses/[courseId]/check-duplicates
9. ⏳ GET /api/mcp/lessons/[lessonId]/check-empty
10. ⏳ Automatic empty resource cleanup tool

## Alternative: Soft Delete Pattern

Instead of preventing duplicates, mark resources as "draft" until complete:

```typescript
// Add to schema
model Lesson {
  status: String @default("draft")  // draft | complete | archived
}

// Only show "complete" resources by default
// Can cleanup "draft" resources periodically
```

This is simpler but doesn't prevent duplicates - just hides them.

## Recommended Approach

**Start with Phase 1** - Simple update endpoints give Claude immediate ability to fix mistakes:

1. Add PUT endpoints for lessons and units
2. Add MCP tools for updates
3. Claude can now fix empty content manually

**Then add Phase 2** - Idempotent upsert makes retries automatic:

1. Add upsert endpoint for lessons
2. Modify expand_brainloop to use upsert mode
3. Claude can safely retry without creating duplicates

This gives us both **manual fix capability** (Phase 1) and **automatic retry safety** (Phase 2).
