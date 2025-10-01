/**
 * @file Server configuration management
 * @module server/config
 *
 * @remarks
 * This module manages all server configuration including environment variables,
 * OAuth settings, and validation. It provides a centralized configuration
 * object that is used throughout the application.
 *
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: OAuth2 client ID from Google app
 * - GOOGLE_CLIENT_SECRET: OAuth2 client secret
 * - JWT_SECRET: Secret key for signing JWT tokens
 * - BRAINLOOP_API_URL: BRAINLOOP API base URL
 * - BRAINLOOP_DATABASE_URL: BRAINLOOP database connection URL
 *
 * Optional environment variables:
 * - OAUTH_ISSUER: Base URL for OAuth endpoints
 * - REDIRECT_URL: OAuth callback URL
 * - PORT: Server port (default: 3000)
 */

import dotenv from "dotenv";
dotenv.config();

/**
 * Server configuration interface
 *
 * @remarks
 * Defines all configuration values required by the server.
 * These values are typically loaded from environment variables.
 */
export interface ServerConfig {
  /** Google OAuth2 client ID */
  GOOGLE_CLIENT_ID: string;
  /** Google OAuth2 client secret */
  GOOGLE_CLIENT_SECRET: string;
  /** Secret key for JWT token signing */
  JWT_SECRET: string;
  /** BRAINLOOP API base URL */
  BRAINLOOP_API_URL: string;
  /** BRAINLOOP database connection URL */
  BRAINLOOP_DATABASE_URL: string;
  /** Base URL for OAuth issuer (production or localhost) */
  OAUTH_ISSUER: string;
  /** OAuth callback redirect URL */
  REDIRECT_URL: string;
  /** Server port number */
  PORT: string;
}

/**
 * Server configuration object
 *
 * @remarks
 * This object is populated from environment variables with sensible defaults.
 * In production, OAUTH_ISSUER defaults to the Smithery server URL.
 * In development, it defaults to localhost:3000.
 */
export const CONFIG: ServerConfig = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  JWT_SECRET: process.env.JWT_SECRET!,
  BRAINLOOP_API_URL: process.env.BRAINLOOP_API_URL!,
  BRAINLOOP_DATABASE_URL: process.env.BRAINLOOP_DATABASE_URL!,
  OAUTH_ISSUER:
    process.env.OAUTH_ISSUER ||
    (process.env.NODE_ENV === "production"
      ? "https://mcp.brainloop.cc"
      : `http://localhost:${process.env.PORT || "3000"}`),
  REDIRECT_URL:
    process.env.REDIRECT_URL ||
    `${process.env.OAUTH_ISSUER || `http://localhost:${process.env.PORT || "3000"}`}/oauth/google/callback`,
  PORT: process.env.PORT || "3000",
} as const;

/**
 * Validates that all required environment variables are present
 * @throws {Error} Thrown if any required environment variable is missing
 * @internal
 */
const requiredEnvVars: (keyof ServerConfig)[] = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "JWT_SECRET",
  "BRAINLOOP_API_URL",
  "BRAINLOOP_DATABASE_URL",
];
for (const envVar of requiredEnvVars) {
  if (!CONFIG[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * List of valid OAuth redirect URIs
 *
 * @remarks
 * These URIs are whitelisted for OAuth callbacks to prevent redirect attacks.
 * The list includes:
 * - SystemPrompt protocol handler for desktop apps
 * - Production SystemPrompt.io callback
 * - Smithery server callback
 * - Local development callbacks
 * - Configured redirect URL from environment
 *
 * Any OAuth callback must match one of these URIs exactly.
 */
export const VALID_REDIRECT_URIS = [
  `http://localhost:${CONFIG.PORT}/oauth/google/callback`,
  "http://localhost:5173/oauth/google/callback",
  "http://localhost:6274/oauth/callback/debug",
  `${CONFIG.OAUTH_ISSUER}/oauth/google/callback`,
  CONFIG.REDIRECT_URL,
];
