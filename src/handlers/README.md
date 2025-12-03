# Handler Functions

This directory contains the core handler functions that process MCP (Model Context Protocol) requests and implement the business logic for interacting with Brainloop.

## Overview

Handlers are the bridge between the MCP protocol and Brainloop's API. They:
- Process incoming tool calls from AI clients
- Execute Brainloop API operations
- Handle AI-assisted content generation through sampling
- Send notifications about operation results

## File Structure

### Core Handlers

#### `tool-handlers.ts`
Main entry point for tool execution:
- Routes tool calls to appropriate handlers
- Validates tool arguments
- Handles errors consistently
- Returns properly formatted MCP responses

#### `sampling.ts`
Manages AI-assisted content generation:
- Sends sampling requests to the AI client
- Routes responses to appropriate callbacks
- Handles session-specific server instances
- Provides progress notifications

#### `notifications.ts`
Notification system for real-time updates:
- Operation status notifications
- Progress tracking
- Error notifications
- Broadcast to all sessions or specific session

#### `prompt-handlers.ts`
Manages prompt templates for tools:
- Provides system prompts for each tool
- Currently returns empty (prompts defined in constants)

#### `resource-handlers.ts`
Resource management for MCP protocol:
- Lists available resources
- Currently implements minimal resource support

### Callback Handlers (`/callbacks`)

Handlers that process AI-generated content:

- **`suggest-action.ts`** - Analyzes content and suggests actions

### Tool Handlers (`/tools`)

Individual tool implementations:

#### Brainloop Management
- **`brainloop-handlers.ts`** - Create, view, and manage brainloops (courses)
- **`track-handlers.ts`** - Manage learning tracks and enrollments

#### Lesson and Content Management
- **`brainloop-handlers.ts`** - Get lessons, units, and course content
- **`brainloop-handlers.ts`** - Update lessons and units
- **`brainloop-handlers.ts`** - Create interactions and prompts

### Supporting Files

#### `action-schema.ts`
JSON schema definitions for:
- Suggested actions structure
- Validation of AI responses

## Request Flow

### Tool Execution Flow
```
1. Client sends tool call → tool-handlers.ts
2. Handler validates arguments
3. Handler calls specific tool function
4. Tool executes Brainloop API call
5. Result formatted and returned
6. Notification sent about completion
```

### Sampling Flow
```
1. Tool needs AI assistance → sends sampling request
2. sampling.ts routes to correct server instance
3. Client generates content with AI
4. Callback handler receives result
5. Callback executes Brainloop operation
6. Notification sent with outcome
```

## Key Patterns

### Authentication Context
All handlers receive authentication context through:
```typescript
interface MCPToolContext {
  sessionId: string;
  authInfo: AuthInfo;
}
```

### Error Handling
Consistent error handling across all handlers:
- Validation errors return clear messages
- API errors are wrapped with context
- All errors logged with details
- User-friendly error messages

### Notification Pattern
Operations follow this pattern:
1. Send "operation started" notification
2. Execute operation
3. Send result notification (success or error)

## Adding New Tools

To add a new tool:

1. Create handler in `/tools` directory
2. Add tool definition in `/constants/tool`
3. Register in `tool-handlers.ts`
4. Add to tool list in constants
5. Implement proper error handling
6. Add notifications for user feedback

## Example Tool Handler

```typescript
export async function handleGetBrainloop(
  args: GetBrainloopArgs,
  context: MCPToolContext
): Promise<ToolResponse> {
  try {
    // Validate arguments
    validateBrainloopArgs(args);
    
    // Get Brainloop service with auth
    const brainloop = new BrainloopService({
      accessToken: context.authInfo.token,
      userId: context.authInfo.extra?.userId || 'unknown',
    });
    
    // Execute API call
    const brainloop = await brainloop.getCourse(args.brainloopId);
    
    // Send success notification
    await sendOperationNotification(
      'get_brainloop',
      `Retrieved brainloop: ${brainloop.title}`,
      context.sessionId
    );
    
    // Return formatted response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(brainloop, null, 2)
      }]
    };
  } catch (error) {
    // Send error notification
    await sendOperationNotification(
      'get_brainloop',
      `Failed to retrieve brainloop: ${error.message}`,
      context.sessionId
    );
    throw error;
  }
}
```

## Testing Considerations

When testing handlers:
- Mock Brainloop API responses
- Test error scenarios
- Verify notification sending
- Check session handling
- Validate argument parsing