import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import type { AssetType, SyncMeta } from '../utils/types';

/**
 * Parse scoped package name into scope and name
 * @param packageName - Package name (e.g., "@canard/schema-form")
 * @returns [scope, name] tuple (e.g., ["@canard", "schema-form"])
 */
export function parsePackageName(packageName: string): [string, string] {
  if (packageName.startsWith('@')) {
    const [scope, name] = packageName.split('/');
    return [scope, name];
  }
  return ['', packageName];
}

/**
 * Get the destination directory for synced assets
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type (commands or skills)
 * @returns Full path to destination directory
 */
export function getDestinationDir(
  cwd: string,
  packageName: string,
  assetType: AssetType,
): string {
  const [scope, name] = parsePackageName(packageName);
  if (scope) {
    return join(cwd, '.claude', assetType, scope, name);
  }
  return join(cwd, '.claude', assetType, name);
}

/**
 * Ensure directory exists (creates recursively if needed)
 * @param dirPath - Directory path
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write file with directory creation
 * @param filePath - Full file path
 * @param content - File content
 */
export function writeFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Read sync metadata file
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @returns SyncMeta or null if not found
 */
export function readSyncMeta(
  cwd: string,
  packageName: string,
  assetType: AssetType,
): SyncMeta | null {
  try {
    const destDir = getDestinationDir(cwd, packageName, assetType);
    const metaPath = join(destDir, '.sync-meta.json');
    const content = readFileSync(metaPath, 'utf-8');
    return JSON.parse(content) as SyncMeta;
  } catch {
    return null;
  }
}

/**
 * Write sync metadata file
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @param meta - Sync metadata
 */
export function writeSyncMeta(
  cwd: string,
  packageName: string,
  assetType: AssetType,
  meta: SyncMeta,
): void {
  const destDir = getDestinationDir(cwd, packageName, assetType);
  const metaPath = join(destDir, '.sync-meta.json');
  writeFile(metaPath, JSON.stringify(meta, null, 2));
}

/**
 * Write asset file to destination
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @param fileName - File name
 * @param content - File content
 */
export function writeAssetFile(
  cwd: string,
  packageName: string,
  assetType: AssetType,
  fileName: string,
  content: string,
): void {
  const destDir = getDestinationDir(cwd, packageName, assetType);
  const filePath = join(destDir, fileName);
  writeFile(filePath, content);
}

/**
 * Clean existing synced files for a package
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 */
export function cleanAssetDir(
  cwd: string,
  packageName: string,
  assetType: AssetType,
): void {
  const destDir = getDestinationDir(cwd, packageName, assetType);
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
}

/**
 * Check if package assets need sync (version mismatch)
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param version - Current package version
 * @returns true if sync is needed
 */
export function needsSync(
  cwd: string,
  packageName: string,
  version: string,
): boolean {
  // Check both asset types
  const commandsMeta = readSyncMeta(cwd, packageName, 'commands');
  const skillsMeta = readSyncMeta(cwd, packageName, 'skills');

  // If neither exists, needs sync
  if (!commandsMeta && !skillsMeta) {
    return true;
  }

  // If version differs in any existing meta, needs sync
  if (commandsMeta && commandsMeta.version !== version) {
    return true;
  }
  if (skillsMeta && skillsMeta.version !== version) {
    return true;
  }

  return false;
}

/**
 * Create SyncMeta object for current sync operation
 * @param version - Package version
 * @param files - List of synced file names
 * @returns SyncMeta object
 */
export function createSyncMeta(version: string, files: string[]): SyncMeta {
  return {
    version,
    syncedAt: new Date().toISOString(),
    files,
  };
}
