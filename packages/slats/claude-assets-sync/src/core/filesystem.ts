import { rmSync } from 'node:fs';
import { join } from 'node:path';

import {
  getDestinationDir as getDestinationDirUtil,
  getFlatDestinationDir as getFlatDestinationDirUtil,
} from '../utils/paths';
import type { AssetType, SyncMeta, UnifiedSyncMeta } from '../utils/types';
import { needsVersionSync } from '../utils/version';
import { DEFAULT_ASSET_TYPES, META_FILES } from './constants';
import {
  ensureDirectory,
  fileExists,
  listDirectory,
  readJsonFile,
  writeJsonFile,
  writeTextFile,
} from './io';

/**
 * Ensure directory exists (creates recursively if needed)
 * @param dirPath - Directory path
 */
export const ensureDir = ensureDirectory;

/**
 * Write file with directory creation
 * @param filePath - Full file path
 * @param content - File content
 */
export const writeFile = writeTextFile;

/**
 * Read sync metadata file
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @returns SyncMeta or null if not found
 */
export const readSyncMeta = (
  cwd: string,
  packageName: string,
  assetType: AssetType,
): SyncMeta | null => {
  const destDir = getDestinationDirUtil(cwd, packageName, assetType);
  const metaPath = join(destDir, META_FILES.SYNC_META);
  return readJsonFile<SyncMeta>(metaPath);
};

/**
 * Write sync metadata file
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @param meta - Sync metadata
 */
export const writeSyncMeta = (
  cwd: string,
  packageName: string,
  assetType: AssetType,
  meta: SyncMeta,
): void => {
  const destDir = getDestinationDirUtil(cwd, packageName, assetType);
  const metaPath = join(destDir, META_FILES.SYNC_META);
  writeJsonFile(metaPath, meta);
};

/**
 * Write asset file to destination
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @param fileName - File name
 * @param content - File content
 */
export const writeAssetFile = (
  cwd: string,
  packageName: string,
  assetType: AssetType,
  fileName: string,
  content: string,
): void => {
  const destDir = getDestinationDirUtil(cwd, packageName, assetType);
  const filePath = join(destDir, fileName);
  writeFile(filePath, content);
};

/**
 * Clean existing synced files for a package
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 */
export const cleanAssetDir = (
  cwd: string,
  packageName: string,
  assetType: AssetType,
): void => {
  const destDir = getDestinationDirUtil(cwd, packageName, assetType);
  if (fileExists(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
};

/**
 * Check if package assets need sync (version mismatch)
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param version - Current package version
 * @param assetTypes - Optional array of asset types to check. If not provided, uses default types.
 * @returns true if sync is needed
 */
export const needsSync = (
  cwd: string,
  packageName: string,
  version: string,
  assetTypes?: string[],
): boolean => {
  // Use provided asset types or default to standard types
  const typesToCheck = assetTypes || [...DEFAULT_ASSET_TYPES];

  // Check all asset types
  const metadataByType = typesToCheck.map((assetType) =>
    readSyncMeta(cwd, packageName, assetType),
  );

  // If none exists, needs sync
  if (metadataByType.every((meta) => !meta)) return true;

  // If version differs in any existing meta, needs sync
  if (
    metadataByType.some(
      (meta) => meta && needsVersionSync(version, meta.version),
    )
  ) {
    return true;
  }

  return false;
};

/**
 * Create SyncMeta object for current sync operation
 * @param version - Package version
 * @param files - List of synced file names
 * @returns SyncMeta object
 */
export const createSyncMeta = (version: string, files: string[]): SyncMeta => ({
  version,
  syncedAt: new Date().toISOString(),
  files,
});

// ============================================================================
// Flat Structure Support Functions (v2)
// ============================================================================

/**
 * Write asset file to flat structure destination
 * @param cwd - Current working directory
 * @param assetType - Asset type (commands or skills)
 * @param flatFileName - Flat file name with prefix (e.g., "canard-schemaForm_guide.md")
 * @param content - File content
 * @example
 * writeFlatAssetFile(cwd, 'commands', 'canard-schemaForm_guide.md', content)
 */
export const writeFlatAssetFile = (
  cwd: string,
  assetType: AssetType,
  flatFileName: string,
  content: string,
): void => {
  const destDir = getFlatDestinationDirUtil(cwd, assetType);
  const filePath = join(destDir, flatFileName);
  writeFile(filePath, content);
};

/**
 * Clean flat asset files with specific prefix
 * Removes only files belonging to the specified package, preserving others
 * @param cwd - Current working directory
 * @param assetType - Asset type (commands, skills, agents, or any custom string)
 * @param prefix - Package prefix (e.g., "canard-schemaForm")
 * @param existingMeta - Existing unified metadata to identify exact files to remove
 * @example
 * cleanFlatAssetFiles(cwd, 'commands', 'canard-schemaForm', meta)
 */
export const cleanFlatAssetFiles = (
  cwd: string,
  assetType: AssetType,
  prefix: string,
  existingMeta: UnifiedSyncMeta | null,
): void => {
  const destDir = getFlatDestinationDirUtil(cwd, assetType);

  if (!fileExists(destDir)) {
    return; // Nothing to clean
  }

  // If we have metadata, use it for precise cleanup
  if (existingMeta?.packages[prefix]) {
    const packageInfo = existingMeta.packages[prefix];
    const filesToRemove = packageInfo.files[assetType];

    // Files can be string[] or FileMapping[], iterate and get transformed names
    if (Array.isArray(filesToRemove)) {
      for (const fileMapping of filesToRemove) {
        // Handle both string (nested structure) and FileMapping (flat structure)
        const fileName =
          typeof fileMapping === 'string'
            ? fileMapping
            : fileMapping.transformed;
        const filePath = join(destDir, fileName);
        if (fileExists(filePath)) {
          rmSync(filePath, { force: true });
        }
      }
    }
  } else {
    // Fallback: pattern-based cleanup (less precise)
    const pattern = `${prefix}_`;
    const files = listDirectory(destDir);

    for (const file of files) {
      if (file.startsWith(pattern) && file.endsWith('.md')) {
        const filePath = join(destDir, file);
        rmSync(filePath, { force: true });
      }
    }
  }
};

/**
 * List flat asset files with specific prefix
 * @param cwd - Current working directory
 * @param assetType - Asset type (commands or skills)
 * @param prefix - Package prefix (e.g., "canard-schemaForm")
 * @returns Array of file names matching the pattern
 * @example
 * listFlatAssetFiles(cwd, 'commands', 'canard-schemaForm')
 * // => ['canard-schemaForm_guide.md', 'canard-schemaForm_usage.md']
 */
export const listFlatAssetFiles = (
  cwd: string,
  assetType: AssetType,
  prefix: string,
): string[] => {
  const destDir = getFlatDestinationDirUtil(cwd, assetType);

  if (!fileExists(destDir)) {
    return [];
  }

  const pattern = `${prefix}_`;
  const files = listDirectory(destDir);

  return files.filter(
    (file) => file.startsWith(pattern) && file.endsWith('.md'),
  );
};
