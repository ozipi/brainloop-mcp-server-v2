# Railway Deployment Guide for BRAINLOOP MCP Server

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/clickable-link)

## Manual Deployment Steps

### 1. Create Railway Project
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init brainloop-mcp-server-v2

# Link to this repository
railway link
```

### 2. Set Environment Variables
Go to Railway dashboard and set these environment variables:

```bash
# Google OAuth (replace with your values)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Production URLs
OAUTH_ISSUER=https://mcp.brainloop.cc
REDIRECT_URL=https://mcp.brainloop.cc/oauth/google/callback

# BRAINLOOP API
BRAINLOOP_API_URL=https://brainloop.cc/api
BRAINLOOP_DATABASE_URL=your_database_connection_string

# Server config
PORT=3000
NODE_ENV=production
```

### 3. Configure Custom Domain
1. Go to Railway dashboard > Settings > Domains
2. Add custom domain: `mcp.brainloop.cc`
3. Update DNS records as instructed

### 4. Deploy
```bash
# Deploy current branch
railway up

# Or let Railway auto-deploy from GitHub
# (Recommended for production)
```

## Environment Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 client credentials
3. Set authorized redirect URI: `https://mcp.brainloop.cc/oauth/google/callback`
4. Add authorized origins: `https://mcp.brainloop.cc`

### Database Connection
The server needs access to BRAINLOOP's database for:
- User authentication validation
- Course data retrieval
- Progress tracking
- Enrollment management

## Health Check
After deployment, test the server:
- Health endpoint: `https://mcp.brainloop.cc/health`
- OAuth discovery: `https://mcp.brainloop.cc/.well-known/oauth-authorization-server`

## Claude Integration
Add the MCP server to Claude:
1. URL: `https://mcp.brainloop.cc`
2. Complete OAuth flow
3. Verify tools appear in Claude interface

## Troubleshooting
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Ensure Google OAuth credentials are correct
- Check domain DNS configuration