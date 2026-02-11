/**
 * Asset structure type (nested or flat)
 */
export type AssetStructure = 'nested' | 'flat';

/**
 * Configuration for a specific asset type
 */
export interface AssetTypeConfig {
  structure: AssetStructure;
}

/**
 * Configuration mapping asset types to their structure
 */
export interface AssetsConfig {
  [assetType: string]: AssetTypeConfig;
}

/**
 * Claude configuration in package.json
 */
export interface ClaudeConfig {
  /** Path to Claude assets directory (e.g., "docs/claude") */
  assetPath: string;
  /** Optional configuration for asset types */
  assets?: AssetsConfig;
}

/**
 * Repository information from package.json
 */
export interface RepositoryInfo {
  type: string;
  url: string;
  directory?: string;
}

/**
 * Parsed package information
 */
export interface PackageInfo {
  name: string;
  version: string;
  repository: RepositoryInfo;
  claude?: ClaudeConfig;
}

/**
 * Parsed GitHub repository details
 */
export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  directory?: string;
}

/**
 * GitHub API file/directory entry
 */
export interface GitHubEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  sha: string;
}

/**
 * Sync metadata stored in .sync-meta.json
 */
export interface SyncMeta {
  /** Package version at sync time */
  version: string;
  /** ISO timestamp of last sync */
  syncedAt: string;
  /** List of synced file names */
  files: string[];
}

/**
 * Asset type (can be any string, not limited to commands/skills/agents)
 */
export type AssetType = string;

/**
 * Sync result for a single package
 */
export interface SyncResult {
  packageName: string;
  success: boolean;
  skipped: boolean;
  reason?: string;
  syncedFiles?: Record<string, string[]>;
}

/**
 * CLI options
 */
export interface CliOptions {
  package: string[];
  force: boolean;
  dryRun: boolean;
  local: boolean;
  /** Custom git ref (branch, tag, or commit) to fetch from */
  ref?: string;
  /** Use flat structure (default: true in v2) */
  flat?: boolean;
}

/**
 * Workspace info from yarn workspaces
 */
export interface WorkspaceInfo {
  name: string;
  location: string;
}

/**
 * Unified sync metadata for all packages (flat structure)
 */
export interface UnifiedSyncMeta {
  /** Schema version for migration support */
  schemaVersion: string;
  /** Last sync timestamp */
  syncedAt: string;
  /** Package metadata keyed by transformed name (e.g., "canard-schemaForm") */
  packages: Record<string, PackageSyncInfo>;
  /** SkillUnit format version marker. Present when data uses SkillUnit[] format. */
  skillUnitFormat?: string;
}

/**
 * Individual package sync info within unified meta
 */
export interface PackageSyncInfo {
  /** Original package name (e.g., "@canard/schema-form") */
  originalName: string;
  /** Package version at sync time */
  version: string;
  /** Whether this package is from local workspace (true) or remote npm (false/undefined) */
  local?: boolean;
  /** Synced skill units per asset type. Each entry is a SkillUnit (atomic unit of selection). */
  files: Record<string, SkillUnit[]>;
  /** Optional exclusions for selective syncing */
  exclusions?: {
    /** Excluded directory paths (e.g., ["skills/deprecated"]) */
    directories: string[];
    /** Excluded file paths (e.g., ["commands/old-cmd.md"]) */
    files: string[];
  };
}

/**
 * File name mapping (original to transformed)
 */
export interface FileMapping {
  /** Original file name (e.g., "guide.md") */
  original: string;
  /** Transformed file name (e.g., "canard-schemaForm_guide.md") */
  transformed: string;
}

/**
 * Represents an atomic skill unit in sync metadata.
 * A skill unit is either a single .md file or a directory skill (containing SKILL.md).
 */
export interface SkillUnit {
  /** Skill name (file name without extension, or directory name) */
  name: string;
  /** Whether this is a directory-based skill */
  isDirectory: boolean;
  /** For flat structure: transformed file/directory name */
  transformed?: string;
  /** Internal files within directory skill (for tree browsing, not individual selection).
   *  Only present when isDirectory is true.
   *  Stores relative paths within the skill directory (e.g., ["SKILL.md", "knowledge/api.md"]) */
  internalFiles?: string[];
}

/**
 * Add command selection result
 */
export interface AddCommandSelection {
  /** Package name */
  packageName: string;
  /** Source type */
  source: 'local' | 'npm';
  /** Git ref (branch, tag, or commit) */
  ref?: string;
  /** Included skill units by asset type (skill unit names, not individual file paths) */
  includedAssets: Record<string, string[]>;
  /** Excluded skill units by asset type (skill unit names, not individual file paths) */
  excludedAssets: Record<string, string[]>;
}

/**
 * Tree node for asset selection
 */
export interface TreeNode {
  /** Unique identifier */
  id: string;
  /** Node label */
  label: string;
  /** Full path */
  path: string;
  /** Node type */
  type: 'directory' | 'file' | 'skill-directory';
  /** Child nodes */
  children?: TreeNode[];
  /** Selection state */
  selected: boolean;
  /** Expanded state */
  expanded: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** If true, this node's children are view-only (cannot be individually selected) */
  viewOnly?: boolean;
  /** Additional metadata */
  metadata?: {
    assetType: string;
    originalName?: string;
    transformedName?: string;
  };
}

/**
 * Re-export asset structure utilities from core module
 *
 * @deprecated These exports are kept for backward compatibility only.
 * Please update your imports to use the recommended paths below.
 *
 * Migration Guide:
 * ================
 *
 * ❌ OLD (Deprecated - will be removed in v1.0.0)
 * ```typescript
 * import {
 *   DEFAULT_ASSET_TYPES,
 *   DEFAULT_ASSET_STRUCTURES,
 *   getAssetStructure,
 *   detectStructureType,
 *   validateAssetStructure,
 *   normalizeAssetStructure,
 * } from './utils/types';
 * ```
 *
 * ✅ NEW (Recommended)
 * ```typescript
 * import {
 *   DEFAULT_ASSET_TYPES,
 *   DEFAULT_ASSET_STRUCTURES,
 *   getAssetStructure,
 *   detectStructureType,
 *   validateAssetStructure,
 *   normalizeAssetStructure,
 * } from './core/assetStructure';
 * ```
 *
 * Why the change?
 * - Clearer module organization (asset structure logic lives in core/)
 * - Direct imports are more maintainable and tree-shake friendly
 * - Reduces coupling between utils and core modules
 *
 * Timeline:
 * - v0.x: Old imports work (with deprecation warnings)
 * - v1.0.0: Re-exports removed
 *
 * @see ../core/assetStructure for the actual implementations
 */
export {
  DEFAULT_ASSET_TYPES,
  DEFAULT_ASSET_STRUCTURES,
  getAssetStructure,
  detectStructureType,
  validateAssetStructure,
  normalizeAssetStructure,
} from '../core/assetStructure';
