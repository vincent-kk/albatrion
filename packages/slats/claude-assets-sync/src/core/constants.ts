/**
 * Central constants for claude-assets-sync
 * All magic strings and repeated constants should be defined here
 */
import { VERSION } from '../version';

/**
 * Base directory for Claude assets
 */
export const CLAUDE_BASE_DIR = '.claude' as const;

/**
 * Asset directory names
 */
export const ASSET_DIRS = {
  COMMANDS: 'commands',
  SKILLS: 'skills',
  AGENTS: 'agents',
} as const;

/**
 * Metadata file names
 */
export const META_FILES = {
  SYNC_META: '.sync-meta.json',
  PROJECT_META: '.project-meta.json',
  UNIFIED_SYNC_META: '.claude/.sync-meta.json',
} as const;

/**
 * Schema versions for metadata files
 */
export const SCHEMA_VERSIONS = {
  UNIFIED_SYNC_META: VERSION,
  LEGACY_SYNC_META: '1.0.0',
} as const;

/**
 * Default asset types (exported for backward compatibility)
 */
export const DEFAULT_ASSET_TYPES = ['commands', 'skills', 'agents'] as const;

/**
 * Default structure configuration for built-in asset types
 *
 * @deprecated Import from './assetStructure' instead to avoid circular dependency.
 * This re-export will be removed in version 1.0.0
 *
 * @example
 * ```typescript
 * // ❌ Old (causes circular dependency)
 * import { DEFAULT_ASSET_STRUCTURES } from './constants';
 *
 * // ✅ New (recommended)
 * import { DEFAULT_ASSET_STRUCTURES } from './assetStructure';
 * ```
 */
// Re-export removed to break circular dependency
// Please import directly from './assetStructure'

/**
 * GitHub API configuration
 */
export const GITHUB_CONFIG = {
  API_BASE: 'https://api.github.com',
  RAW_BASE: 'https://raw.githubusercontent.com',
  DEFAULT_REF: 'HEAD',
} as const;

/**
 * File system patterns
 */
export const FS_PATTERNS = {
  SCOPE_PACKAGE_REGEX: /^@([^/]+)\/(.+)$/,
  GITHUB_HTTPS_URL: /https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/,
  GITHUB_SSH_URL: /git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/,
  GITHUB_SHORTHAND: /^github:([^/]+)\/([^/]+)$/,
} as const;

/**
 * CLI exit codes
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGS: 2,
  NO_PACKAGES: 3,
} as const;

/**
 * Logging prefixes
 */
export const LOG_PREFIXES = {
  ERROR: '❌',
  SUCCESS: '✓',
  INFO: 'ℹ',
  WARNING: '⚠️',
  DRY_RUN: '👀',
  SKIP: '⏭️',
} as const;
