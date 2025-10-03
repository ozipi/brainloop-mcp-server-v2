/**
 * Version information for the MCP server
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
let version = '3.2.1';
try {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  version = packageJson.version;
} catch (error) {
  console.warn('Could not read version from package.json, using default:', version);
}

export const VERSION = version;
export const BUILD_DATE = new Date().toISOString();

export function getVersionInfo() {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    name: 'brainloop-mcp-server',
    features: [
      'OAuth 2.1 Authentication',
      'Lesson/Unit Updates',
      'Prompts & Interactions',
      'Lesson ID Visibility',
      'Token Auto-Refresh',
      'Get Unit Lessons',
    ],
  };
}
