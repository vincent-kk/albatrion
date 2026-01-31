/**
 * Claude configuration in package.json
 */
export interface ClaudeConfig {
  /** Path to Claude assets directory (e.g., "docs/claude") */
  assetPath: string;
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
 * Asset type (commands or skills)
 */
export type AssetType = 'commands' | 'skills';

/**
 * Sync result for a single package
 */
export interface SyncResult {
  packageName: string;
  success: boolean;
  skipped: boolean;
  reason?: string;
  syncedFiles?: {
    commands: string[];
    skills: string[];
  };
}

/**
 * CLI options
 */
export interface CliOptions {
  package: string[];
  force: boolean;
  dryRun: boolean;
}
