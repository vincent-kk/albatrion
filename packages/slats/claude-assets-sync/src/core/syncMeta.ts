import { join } from 'node:path';

import type {
  FileMapping,
  PackageSyncInfo,
  SkillUnit,
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
  const meta = readJsonFile<UnifiedSyncMeta>(metaPath);
  if (meta && needsSkillUnitMigration(meta)) {
    // In-memory migration only -- do NOT write back.
    // The migrated format is persisted naturally on the next writeUnifiedSyncMeta() call.
    return migrateToSkillUnitSchema(meta);
  }
  return meta;
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
 * Add a skill unit to a package's asset type in unified metadata
 */
export function addSkillUnitToPackage(
  meta: UnifiedSyncMeta,
  prefix: string,
  assetType: string,
  unit: SkillUnit,
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  const existingUnits = (pkgInfo.files[assetType] || []) as SkillUnit[];

  // Check if a skill unit with matching name already exists
  const unitExists = existingUnits.some((u) => u.name === unit.name);
  if (unitExists) {
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
          [assetType]: [...existingUnits, unit],
        },
      },
    },
  };
}

/**
 * Remove a skill unit from a package's asset type in unified metadata
 */
export function removeSkillUnitFromPackage(
  meta: UnifiedSyncMeta,
  prefix: string,
  assetType: string,
  skillName: string,
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  const existingUnits = (pkgInfo.files[assetType] || []) as SkillUnit[];
  const updatedUnits = existingUnits.filter((u) => u.name !== skillName);

  if (existingUnits.length === updatedUnits.length) {
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
          [assetType]: updatedUnits,
        },
      },
    },
  };
}

/**
 * Update package version in unified metadata
 */
export function updatePackageVersion(
  meta: UnifiedSyncMeta,
  prefix: string,
  newVersion: string,
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  return {
    ...meta,
    syncedAt: new Date().toISOString(),
    packages: {
      ...meta.packages,
      [prefix]: {
        ...pkgInfo,
        version: newVersion,
      },
    },
  };
}

/**
 * Update filesystem metadata for a package's asset type
 */
export function updatePackageFilesystemMeta(
  meta: UnifiedSyncMeta,
  prefix: string,
  assetType: string,
  updatedUnits: SkillUnit[],
): UnifiedSyncMeta {
  const pkgInfo = meta.packages[prefix];
  if (!pkgInfo) {
    throw new Error(`Package ${prefix} not found in metadata`);
  }

  return {
    ...meta,
    syncedAt: new Date().toISOString(),
    skillUnitFormat: SCHEMA_VERSIONS.SKILL_UNIT_FORMAT,
    packages: {
      ...meta.packages,
      [prefix]: {
        ...pkgInfo,
        files: {
          ...pkgInfo.files,
          [assetType]: updatedUnits,
        },
      },
    },
  };
}

/**
 * Check if unified metadata needs migration to SkillUnit format
 */
export function needsSkillUnitMigration(meta: UnifiedSyncMeta): boolean {
  // If skillUnitFormat matches current version, no migration needed
  if (meta.skillUnitFormat === SCHEMA_VERSIONS.SKILL_UNIT_FORMAT) {
    return false;
  }

  // Check actual data format
  for (const pkgInfo of Object.values(meta.packages)) {
    for (const rawFiles of Object.values(pkgInfo.files)) {
      const files = rawFiles as unknown[];
      if (!Array.isArray(files) || files.length === 0) {
        continue;
      }

      const first = files[0];

      // Old nested format: plain strings
      if (typeof first === 'string') {
        return true;
      }

      // Old flat format: has original/transformed but no isDirectory
      if (
        typeof first === 'object' &&
        first !== null &&
        'original' in first &&
        'transformed' in first &&
        !('isDirectory' in first)
      ) {
        return true;
      }

      // New format: has isDirectory key
      if (typeof first === 'object' && first !== null && 'isDirectory' in first) {
        return false;
      }
    }
  }

  // All arrays empty or no packages -- no migration needed
  return false;
}

/**
 * Migrate unified metadata from old format to SkillUnit format (in-memory only)
 */
export function migrateToSkillUnitSchema(
  meta: UnifiedSyncMeta,
): UnifiedSyncMeta {
  const migratedPackages: Record<string, PackageSyncInfo> = {};

  for (const [prefix, pkgInfo] of Object.entries(meta.packages)) {
    const migratedFiles: Record<string, SkillUnit[]> = {};

    for (const [assetType, rawFiles] of Object.entries(pkgInfo.files)) {
      const files = rawFiles as unknown[];
      if (!Array.isArray(files) || files.length === 0) {
        migratedFiles[assetType] = [];
        continue;
      }

      const first = files[0];

      if (typeof first === 'string') {
        // Old nested format: string[] -> SkillUnit[] (all default to non-directory)
        migratedFiles[assetType] = (files as string[]).map((name) => ({
          name,
          isDirectory: false,
        }));
      } else if (
        typeof first === 'object' &&
        first !== null &&
        'original' in first &&
        !('isDirectory' in first)
      ) {
        // Old flat format: FileMapping[] -> group by first path segment
        const fileMappings = files as unknown as FileMapping[];
        const groupedByDir = new Map<string, { transformed: string; internalFiles: string[] }>();
        const singleFiles: SkillUnit[] = [];

        for (const mapping of fileMappings) {
          const slashIndex = mapping.original.indexOf('/');
          if (slashIndex === -1) {
            // Single file skill
            singleFiles.push({
              name: mapping.original,
              isDirectory: false,
              transformed: mapping.transformed,
            });
          } else {
            // Part of a directory skill
            const dirName = mapping.original.substring(0, slashIndex);
            const internalFile = mapping.original.substring(slashIndex + 1);
            const transformedSlashIndex = mapping.transformed.indexOf('/');
            const transformedDir = transformedSlashIndex !== -1
              ? mapping.transformed.substring(0, transformedSlashIndex)
              : mapping.transformed;

            if (!groupedByDir.has(dirName)) {
              groupedByDir.set(dirName, { transformed: transformedDir, internalFiles: [] });
            }
            groupedByDir.get(dirName)!.internalFiles.push(internalFile);
          }
        }

        // Convert grouped directories to SkillUnits
        const dirSkillUnits: SkillUnit[] = [];
        for (const [dirName, data] of groupedByDir.entries()) {
          dirSkillUnits.push({
            name: dirName,
            isDirectory: true,
            transformed: data.transformed,
            internalFiles: data.internalFiles,
          });
        }

        migratedFiles[assetType] = [...singleFiles, ...dirSkillUnits];
      } else {
        // Already in new format or unknown - keep as-is
        migratedFiles[assetType] = files as SkillUnit[];
      }
    }

    migratedPackages[prefix] = {
      ...pkgInfo,
      files: migratedFiles,
    };
  }

  return {
    ...meta,
    skillUnitFormat: SCHEMA_VERSIONS.SKILL_UNIT_FORMAT,
    packages: migratedPackages,
  };
}
