# MCP API Endpoint Audit & Missing Pieces

## Current MCP API Endpoints

### ✅ Courses
- `POST /api/mcp/courses/batch` - Create multiple courses
- `GET /api/mcp/courses` - List courses (public)
- `GET /api/mcp/courses/my-courses` - Get user's courses
- `GET /api/mcp/courses/[courseId]` - Get course details
- `POST /api/mcp/courses/[courseId]/enroll` - Enroll in course
- `GET /api/mcp/courses/[courseId]/progress` - Get course progress

### ✅ Units
- `GET /api/mcp/courses/[courseId]/units` - Get course units
- `POST /api/mcp/courses/[courseId]/units/batch` - Create multiple units

### ✅ Lessons
- `GET /api/mcp/units/[unitId]/lessons` - Get unit lessons
- `POST /api/mcp/units/[unitId]/lessons/batch` - Create multiple lessons
- `GET /api/mcp/lessons/[lessonId]` - Get lesson details
- `POST /api/mcp/lessons/[lessonId]/complete` - Mark lesson complete
- `GET /api/mcp/lessons/search` - Search lessons

### ⚠️ Interactions (Partially)
- `POST /api/mcp/lessons/[lessonId]/interaction` - Create interaction *(JUST ADDED)*
- ❌ `GET /api/mcp/lessons/[lessonId]/interaction` - Get lesson interaction (MISSING)

### ❌ Prompts (ALL MISSING from MCP)
- ❌ `POST /api/mcp/prompts` - Create single prompt
- ❌ `POST /api/mcp/prompts/batch` - Create multiple prompts
- ❌ `GET /api/mcp/lessons/[lessonId]/prompts` - Get lesson prompts
- ❌ `GET /api/mcp/prompts/[promptId]` - Get prompt details
- ❌ `PUT /api/mcp/prompts/[promptId]` - Update prompt
- ❌ `DELETE /api/mcp/prompts/[promptId]` - Delete prompt

### ✅ Progress
- `GET /api/mcp/progress` - Get user progress

### ✅ User
- `GET /api/mcp/user/profile` - Get user profile
- `GET /api/mcp/user/analytics` - Get user analytics

---

## Missing MCP Endpoints (Priority Order)

### 🔴 Critical - Needed for Questions/Interactions

#### 1. **Prompts Management**
```
POST   /api/mcp/prompts              Create single prompt (with all fields)
POST   /api/mcp/prompts/batch        Create multiple prompts at once
GET    /api/mcp/lessons/[lessonId]/prompts   Get all prompts for a lesson (verification!)
```

**Why Critical:**
- Claude needs to create questions/exercises after creating lessons
- GET endpoint allows verification before creating duplicates
- Reduces token waste by checking what exists

#### 2. **Interaction Details**
```
GET    /api/mcp/lessons/[lessonId]/interaction   Get interaction details + ID
```

**Why Needed:**
- Must get interaction ID before creating prompts
- Current: Only POST exists to create, but no GET to retrieve existing
- Prevents duplicate interaction creation

### 🟡 Important - For Better Reliability

#### 3. **Verification/Check Endpoints**
```
GET    /api/mcp/courses/[courseId]/check      Check if course has lessons/units
GET    /api/mcp/units/[unitId]/check          Check if unit has lessons
GET    /api/mcp/lessons/[lessonId]/check      Check lesson completeness
```

**Why Important:**
- Allows Claude to verify each step before proceeding
- Reduces duplicate creation
- Better error recovery

#### 4. **Update Endpoints** (for fixing mistakes)
```
PUT    /api/mcp/lessons/[lessonId]            Update lesson content
PUT    /api/mcp/prompts/[promptId]            Update prompt
DELETE /api/mcp/prompts/[promptId]            Delete prompt (to fix duplicates)
```

**Why Important:**
- Fixing errors without recreating everything
- Removing duplicates when they occur

### 🟢 Nice to Have - For Optimization

#### 5. **Bulk Verification**
```
POST   /api/mcp/verify/lesson-complete        Check if lesson has content + prompts
POST   /api/mcp/verify/unit-complete          Check if unit has all lessons
```

**Why Nice:**
- Single API call to verify completeness
- Reduces multiple round-trips
- Token optimization

#### 6. **Duplicate Detection**
```
GET    /api/mcp/lessons/[lessonId]/duplicates      Check for duplicate prompts
POST   /api/mcp/check-duplicates                   Batch check before creating
```

**Why Nice:**
- Proactive duplicate prevention
- Better UX for Claude

---

## Recommended Implementation Order

### Phase 1: Critical Prompts Support (DO THIS NOW)
1. ✅ `POST /api/mcp/lessons/[lessonId]/interaction` - Already created
2. ❌ `GET /api/mcp/lessons/[lessonId]/interaction` - Get interaction (critical!)
3. ❌ `GET /api/mcp/lessons/[lessonId]/prompts` - List prompts (verification!)
4. ❌ `POST /api/mcp/prompts` - Create single prompt
5. ❌ `POST /api/mcp/prompts/batch` - Create multiple prompts

### Phase 2: Update/Delete Support
6. ❌ `PUT /api/mcp/prompts/[promptId]` - Update prompt
7. ❌ `DELETE /api/mcp/prompts/[promptId]` - Delete prompt
8. ❌ `PUT /api/mcp/lessons/[lessonId]` - Update lesson

### Phase 3: Verification Helpers
9. ❌ `GET /api/mcp/lessons/[lessonId]/check` - Completeness check
10. ❌ `POST /api/mcp/verify/lesson-complete` - Bulk verification

---

## Current Workflow Issues

### Problem: Creating 5 Interactions per Lesson

**Current Process:**
1. Create lesson → Get lesson ID
2. Create interaction → Get interaction ID
3. Create prompt 1 → Wait for response
4. Create prompt 2 → Wait for response
5. Create prompt 3 → Wait for response
6. Create prompt 4 → Wait for response
7. Create prompt 5 → Wait for response

**Total: 7 API calls + 7 round trips per lesson**

### Proposed Optimized Process:

1. Create lesson → Get lesson ID
2. **Check if lesson has interaction** → Get interaction ID (NEW!)
3. **Check existing prompts** → Get count (NEW!)
4. Create missing prompts via batch → 1 call (NEW!)

**Total: 4 API calls, prevents duplicates, much faster**

---

## Token Optimization Strategy

### Without Verification Endpoints:
```
Create lesson → Hope it worked → Create interaction → Hope it worked →
Create 5 prompts individually → Hope they all worked →
No way to check without creating duplicates
```

### With Verification Endpoints:
```
Create lesson → Verify created → Get interaction (or create) →
Check existing prompts → Create only missing prompts →
Verify all 5 exist → Done!
```

**Tokens Saved:**
- Prevents duplicate creation attempts
- Reduces error recovery overhead
- Single verification vs multiple create attempts

---

## Next Steps

1. **Immediate:** Create Phase 1 endpoints (prompts CRUD + interaction GET)
2. **Document:** Add MCP-specific docs for each endpoint
3. **Test:** Verify end-to-end flow works without duplicates
4. **Optimize:** Add batch verification endpoints

---

## API Design Principles for MCP

### ✅ DO:
- Return full object details (IDs, counts, status)
- Include verification data in responses
- Make GET endpoints idempotent
- Return existing resources instead of errors when appropriate
- Include helpful metadata (count, exists, etc.)

### ❌ DON'T:
- Require multiple calls to check existence
- Return 404 when resource might exist elsewhere
- Create duplicates silently
- Make Claude guess if something worked

---

## Example Improved Response Format

### Bad (Current):
```json
{
  "message": "Interaction created successfully",
  "interaction": { "id": "abc123" }
}
```

### Good (Proposed):
```json
{
  "message": "Interaction created successfully",
  "interaction": {
    "id": "abc123",
    "lessonId": "lesson-1",
    "type": "assessment",
    "promptCount": 0,
    "createdAt": "2025-10-03T10:00:00Z"
  },
  "lesson": {
    "id": "lesson-1",
    "title": "Introduction to Python",
    "hasInteraction": true,
    "promptCount": 0
  }
}
```

**Benefits:**
- Claude knows interaction ID immediately
- Can see if prompts already exist
- Can verify lesson state in one call
