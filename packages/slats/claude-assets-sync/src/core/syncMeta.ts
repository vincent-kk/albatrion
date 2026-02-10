import { join } from 'node:path';

import type {
  FileMapping,
  PackageSyncInfo,
  UnifiedSyncMeta,
} from '@/claude-assets-sync/utils/types.js';
import { needsVersionSync } from '@/claude-assets-sync/utils/version.js';

import { META_FILES, SCHEMA_VERSIONS } from './constants';
import { readJsonFile, writeJsonFile } from './io';

/**
 * Path to the unified sync metadata file relative to project root
 */
const UNIFIED_META_PATH = META_FILES.UNIFIED_SYNC_META;

/**
 * Schema version for the unified metadata format
 */
export const SCHEMA_VERSION = SCHEMA_VERSIONS.UNIFIED_SYNC_META;

/**
 * Read unified sync metadata from .claude/.sync-meta.json
 *
 * @param cwd - Project root directory
 * @returns Unified metadata object or null if file doesn't exist
 */
export function readUnifiedSyncMeta(cwd: string): UnifiedSyncMeta | null {
  const metaPath = join(cwd, UNIFIED_META_PATH);
  return readJsonFile<UnifiedSyncMeta>(metaPath);
}

/**
 * Write unified sync metadata to .claude/.sync-meta.json
 *
 * @param cwd - Project root directory
 * @param meta - Unified metadata to write
 */
export function writeUnifiedSyncMeta(cwd: string, meta: UnifiedSyncMeta): void {
  const metaPath = join(cwd, UNIFIED_META_PATH);

  try {
    writeJsonFile(metaPath, meta);
  } catch (error) {
    console.error(`Failed to write unified sync meta to ${metaPath}:`, error);
    throw error;
  }
}

/**
 * Update or add package information in unified metadata
 *
 * @param meta - Current unified metadata
 * @param prefix - Package prefix (e.g., 'canard-schema-form')
 * @param info - Package sync information to store
 * @returns Updated metadata object
 */
export function updatePackageInMeta(
  meta: UnifiedSyncMeta,
  prefix: string,
  info: PackageSyncInfo,
): UnifiedSyncMeta {
  return {
    ...meta,
    syncedAt: new Date().toISOString(),
    packages: {
      ...meta.packages,
      [prefix]: info,
    },
  };
}

/**
 * Remove package from unified metadata
 *
 * @param meta - Current unified metadata
 * @param prefix - Package prefix to remove
 * @returns Updated metadata object
 */
export function removePackageFromMeta(
  meta: UnifiedSyncMeta,
  prefix: string,
): UnifiedSyncMeta {
  const { [prefix]: removed, ...remainingPackages } = meta.packages;

  return {
    ...meta,
    packages: remainingPackages,
  };
}

/**
 * Check if package needs sync based on version comparison
 *
 * @param meta - Current unified metadata (null if no metadata exists)
 * @param prefix - Package prefix to check
 * @param version - Current package version
 * @returns true if sync is needed (no metadata, no package entry, or version mismatch)
 */
export function needsSyncUnified(
  meta: UnifiedSyncMeta | null,
  prefix: string,
  version: string,
): boolean {
  // No metadata file → needs sync
  if (!meta) {
    return true;
  }

  // Package not in metadata → needs sync
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    return true;
  }

  // Version mismatch → needs sync
  return needsVersionSync(version, pkgInfo.version);
}

/**
 * Create empty unified metadata structure
 *
 * @returns New empty unified metadata object
 */
export function createEmptyUnifiedMeta(): UnifiedSyncMeta {
  return {
    schemaVersion: SCHEMA_VERSION,
    syncedAt: new Date().toISOString(),
    packages: {},
  };
}

/**
 * Add a file to a package's asset type in unified metadata
 *
 * @param meta - Current unified metadata
 * @param prefix - Package prefix (e.g., 'canard-schema-form')
 * @param assetType - Asset type (e.g., 'commands', 'skills')
 * @param fileName - File name to add
 * @returns Updated metadata object
 */
export function addFileToPackage(
  meta: UnifiedSyncMeta,
  prefix: string,
  assetType: string,
  fileName: string,
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  const existingFiles = pkgInfo.files[assetType] || [];

  // Check if file already exists (handle both string[] and FileMapping[])
  // For FileMapping, match against both original and transformed names
  const fileExists = existingFiles.some((f) =>
    typeof f === 'string'
      ? f === fileName
      : f.original === fileName || f.transformed === fileName,
  );

  if (fileExists) {
    // File already exists, return unchanged
    return meta;
  }

  // Add the new file (maintain the same structure)
  const updatedFiles =
    Array.isArray(existingFiles) &&
    existingFiles.length > 0 &&
    typeof existingFiles[0] === 'object'
      ? [
          ...(existingFiles as any[]),
          { original: fileName, transformed: fileName },
        ]
      : [...(existingFiles as string[]), fileName].sort();

  return {
    ...meta,
    syncedAt: new Date().toISOString(),
    packages: {
      ...meta.packages,
      [prefix]: {
        ...pkgInfo,
        files: {
          ...pkgInfo.files,
          [assetType]: updatedFiles as string[] | FileMapping[],
        },
      },
    },
  };
}

/**
 * Remove a file from a package's asset type in unified metadata
 *
 * @param meta - Current unified metadata
 * @param prefix - Package prefix (e.g., 'canard-schema-form')
 * @param assetType - Asset type (e.g., 'commands', 'skills')
 * @param fileName - File name to remove
 * @returns Updated metadata object
 */
export function removeFileFromPackage(
  meta: UnifiedSyncMeta,
  prefix: string,
  assetType: string,
  fileName: string,
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  const existingFiles = pkgInfo.files[assetType] || [];

  // Filter out the file (handle both string[] and FileMapping[])
  // For FileMapping, match against both original and transformed names
  const updatedFiles = existingFiles.filter((f) =>
    typeof f === 'string'
      ? f !== fileName
      : f.original !== fileName && f.transformed !== fileName,
  ) as string[] | FileMapping[];

  // If no change, return original
  if (existingFiles.length === updatedFiles.length) {
    return meta;
  }

  return {
    ...meta,
    syncedAt: new Date().toISOString(),
    packages: {
      ...meta.packages,
      [prefix]: {
        ...pkgInfo,
        files: {
          ...pkgInfo.files,
          [assetType]: updatedFiles,
        },
      },
    },
  };
}
