/**
 * Common types for command modules
 */
import type { SkillUnit } from '@/claude-assets-sync/utils/types';

/**
 * Base command result
 */
export interface CommandResult {
  success: boolean;
  message?: string;
}

/**
 * Options for sync command
 */
export interface SyncCommandOptions {
  package: string[];
  force: boolean;
  dryRun: boolean;
  local: boolean;
  ref?: string;
  flat?: boolean;
}

/**
 * Options for list command
 */
export interface ListCommandOptions {
  json?: boolean;
}

/**
 * Options for remove command
 */
export interface RemoveCommandOptions {
  package: string;
  yes?: boolean;
  dryRun?: boolean;
}

/**
 * Options for status command
 */
export interface StatusCommandOptions {
  noRemote?: boolean;
}

/**
 * Options for migrate command
 */
export interface MigrateCommandOptions {
  dryRun?: boolean;
}

/**
 * Package list item
 */
export interface PackageListItem {
  name: string;
  version: string;
  syncedAt: string;
  assetCount: number;
  assets: Record<string, number>;
}

/**
 * Package status item
 */
export interface PackageStatusItem {
  name: string;
  localVersion: string;
  remoteVersion?: string;
  upToDate: boolean;
  syncedAt: string;
  error?: string;
  files: Record<string, SkillUnit[]>;
  fileCount: number;
}

/**
 * Remote version cache entry
 */
export interface RemoteVersionCache {
  [packageName: string]: {
    version: string;
    timestamp: number;
  };
}
