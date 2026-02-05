import { join } from 'node:path';

import { CLAUDE_BASE_DIR, META_FILES } from '../core/constants';
import { parsePackageName } from './packageName';
import type { AssetType } from './types';

/**
 * Get the destination directory for synced assets (nested structure)
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type (commands or skills)
 * @returns Full path to destination directory
 *
 * @example
 * getDestinationDir('/project', '@canard/schema-form', 'commands')
 * // => '/project/.claude/commands/@canard/schema-form'
 */
export function getDestinationDir(
  cwd: string,
  packageName: string,
  assetType: AssetType,
): string {
  const [scope, name] = parsePackageName(packageName);
  if (scope) return join(cwd, CLAUDE_BASE_DIR, assetType, scope, name);
  return join(cwd, CLAUDE_BASE_DIR, assetType, name);
}

/**
 * Get the flat destination directory for synced assets (no nesting)
 * @param cwd - Current working directory
 * @param assetType - Asset type (commands or skills)
 * @returns Full path to flat destination directory
 *
 * @example
 * getFlatDestinationDir('/project', 'commands')
 * // => '/project/.claude/commands'
 */
export function getFlatDestinationDir(
  cwd: string,
  assetType: AssetType,
): string {
  return join(cwd, CLAUDE_BASE_DIR, assetType);
}

/**
 * Get the path to sync metadata file for nested structure
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @returns Full path to .sync-meta.json
 */
export function getMetaFilePath(
  cwd: string,
  packageName: string,
  assetType: AssetType,
): string {
  const destDir = getDestinationDir(cwd, packageName, assetType);
  return join(destDir, META_FILES.SYNC_META);
}

/**
 * Get the path to unified sync metadata file
 * @param cwd - Current working directory
 * @returns Full path to .claude/.sync-meta.json
 */
export function getUnifiedMetaFilePath(cwd: string): string {
  return join(cwd, META_FILES.UNIFIED_SYNC_META);
}

/**
 * Get the path to an asset file in nested structure
 * @param cwd - Current working directory
 * @param packageName - Package name
 * @param assetType - Asset type
 * @param fileName - File name
 * @returns Full path to asset file
 */
export function getAssetFilePath(
  cwd: string,
  packageName: string,
  assetType: AssetType,
  fileName: string,
): string {
  const destDir = getDestinationDir(cwd, packageName, assetType);
  return join(destDir, fileName);
}

/**
 * Get the path to an asset file in flat structure
 * @param cwd - Current working directory
 * @param assetType - Asset type
 * @param flatFileName - Flat file name with prefix
 * @returns Full path to flat asset file
 */
export function getFlatAssetFilePath(
  cwd: string,
  assetType: AssetType,
  flatFileName: string,
): string {
  const destDir = getFlatDestinationDir(cwd, assetType);
  return join(destDir, flatFileName);
}
