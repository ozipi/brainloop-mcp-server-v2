# Brainloop MCP Server Source Code

This directory contains the source code for the Brainloop Model Context Protocol (MCP) server. The server enables AI assistants to interact with Brainloop through a standardized protocol.

## Directory Structure

### Entry Points

- **`index.ts`** - Main executable entry point for running the server directly
- **`server.ts`** - HTTP server implementation that handles OAuth and hosts MCP endpoints

### Core Directories

#### `/constants`
Static definitions for tools, sampling operations, and their schemas. This is where all tool definitions and prompts are centralized.

#### `/handlers`
Request handlers that implement the business logic for:
- Tool execution (create, view, manage brainloops)
- Sampling operations (AI-assisted content generation)
- Notifications and progress tracking
- Resource management

#### `/server`
HTTP server infrastructure including:
- OAuth2 authentication flow (Google OAuth)
- MCP protocol endpoints
- Session management
- Middleware for security and validation

#### `/services`
External service integrations:
- Brainloop API client with OAuth support

#### `/types`
TypeScript type definitions for:
- Brainloop API data structures
- MCP protocol extensions
- Internal application types

#### `/utils`
Utility functions for:
- Validation
- Logging
- Error handling

## Architecture Overview

The server follows a layered architecture:

1. **Entry Layer** - Main entry point for server execution
2. **Server Layer** - HTTP server with OAuth and MCP protocol support
3. **Handler Layer** - Business logic for processing MCP requests
4. **Service Layer** - Brainloop API integration
5. **Utility Layer** - Cross-cutting concerns

## Key Concepts

### Authentication Flow
1. User initiates OAuth flow through `/oauth/authorize`
2. Google redirects back with authorization code
3. Server exchanges code for access token
4. Token is stored per session for subsequent API calls

### MCP Protocol Implementation
- Tools allow AI to create, view, and manage brainloops (courses)
- Sampling enables AI-assisted content generation
- Notifications provide real-time feedback
- Sessions maintain authentication context

### Multi-Session Support
The server supports multiple concurrent users, each with their own:
- Authentication credentials
- MCP server instance
- Session state

## Development

To understand how the server works:

1. Start with `index.ts` to see the main entry point
2. Follow the flow through `server.ts` for HTTP setup
3. Look at `/server/mcp.ts` for MCP protocol handling
4. Examine `/handlers` for business logic
5. Check `/services` for Brainloop API integration

Each subdirectory contains its own README with more detailed information about its specific functionality.
