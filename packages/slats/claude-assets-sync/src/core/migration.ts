/**
 * Migration utilities for converting from legacy nested structure to flat structure
 *
 * This module provides functions to:
 * - Detect legacy nested directory structures (.claude/{commands,skills}/@scope/package/)
 * - Migrate assets from nested to flat structure with name prefixing
 * - Update unified sync metadata during migration
 * - Clean up empty legacy directories after migration
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';

import { toFlatFileName } from '@/claude-assets-sync/utils/nameTransform.js';
import { packageNameToPrefix } from '@/claude-assets-sync/utils/packageName.js';

import type {
  AssetType,
  PackageSyncInfo,
  SkillUnit,
  SyncMeta,
} from '../utils/types.js';
import { writeFlatAssetFile } from './filesystem.js';
import {
  createEmptyUnifiedMeta,
  readUnifiedSyncMeta,
  updatePackageInMeta,
  writeUnifiedSyncMeta,
} from './syncMeta.js';

/**
 * Result of migration operation
 */
export interface MigrationResult {
  /** Whether migration completed successfully */
  success: boolean;
  /** List of package names that were migrated */
  migratedPackages: string[];
  /** List of errors encountered during migration */
  errors?: string[];
}

/**
 * Check if migration from nested to flat structure is needed
 * Scans for legacy nested directory patterns: .claude/{commands,skills}/@scope/package/
 *
 * @param cwd - Current working directory (project root)
 * @returns true if legacy nested directories exist
 *
 * @example
 * ```ts
 * if (needsMigration(process.cwd())) {
 *   console.log('Legacy structure detected, migration recommended');
 * }
 * ```
 */
export function needsMigration(cwd: string): boolean {
  const assetTypes: AssetType[] = ['commands', 'skills'];

  for (const assetType of assetTypes) {
    const assetDir = join(cwd, '.claude', assetType);

    if (!existsSync(assetDir)) {
      continue;
    }

    try {
      const entries = readdirSync(assetDir);

      // Check for scoped directories (starting with '@')
      for (const entry of entries) {
        if (entry.startsWith('@')) {
          const scopeDir = join(assetDir, entry);

          // Verify it's a directory
          if (statSync(scopeDir).isDirectory()) {
            return true; // Found legacy nested structure
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${assetDir}:`, error);
      continue;
    }
  }

  return false;
}

/**
 * Migrate from legacy nested structure to flat structure
 *
 * Process:
 * 1. Scan .claude/{commands,skills}/@scope/package/ directories
 * 2. Read legacy .sync-meta.json files from each package
 * 3. Copy files to flat structure with name prefixes (scope-package_filename.md)
 * 4. Create or update unified .sync-meta.json
 * 5. Remove empty legacy directories (if not dry-run)
 *
 * @param cwd - Current working directory (project root)
 * @param options - Migration options
 * @param options.dryRun - If true, only simulate migration without making changes
 * @returns Migration result with success status and list of migrated packages
 *
 * @example
 * ```ts
 * // Preview migration without making changes
 * const preview = await migrateToFlat(process.cwd(), { dryRun: true });
 * console.log(`Would migrate ${preview.migratedPackages.length} packages`);
 *
 * // Perform actual migration
 * const result = await migrateToFlat(process.cwd(), { dryRun: false });
 * if (result.success) {
 *   console.log(`Successfully migrated: ${result.migratedPackages.join(', ')}`);
 * }
 * ```
 */
export async function migrateToFlat(
  cwd: string,
  options: { dryRun?: boolean } = {},
): Promise<MigrationResult> {
  const { dryRun = false } = options;
  const migratedPackages: string[] = [];
  const errors: string[] = [];

  console.log(
    `\n🔄 Starting migration to flat structure${dryRun ? ' (DRY RUN)' : ''}...`,
  );

  // Load or create unified metadata
  let unifiedMeta = readUnifiedSyncMeta(cwd);
  if (!unifiedMeta) {
    console.log('📝 Creating new unified sync metadata');
    unifiedMeta = createEmptyUnifiedMeta();
  }

  const assetTypes: AssetType[] = ['commands', 'skills'];

  // Track all legacy directories for cleanup
  const legacyDirs: string[] = [];

  for (const assetType of assetTypes) {
    const assetDir = join(cwd, '.claude', assetType);

    if (!existsSync(assetDir)) {
      continue;
    }

    console.log(`\n📂 Scanning ${assetType}...`);

    try {
      const scopeDirs = readdirSync(assetDir).filter((entry) => {
        const fullPath = join(assetDir, entry);
        return entry.startsWith('@') && statSync(fullPath).isDirectory();
      });

      for (const scopeDir of scopeDirs) {
        const scopePath = join(assetDir, scopeDir);

        // Scan package directories within scope
        const packageDirs = readdirSync(scopePath).filter((entry) => {
          const fullPath = join(scopePath, entry);
          return statSync(fullPath).isDirectory();
        });

        for (const packageDir of packageDirs) {
          const packagePath = join(scopePath, packageDir);
          const packageName = `${scopeDir}/${packageDir}`;

          console.log(`  📦 Processing ${packageName}...`);

          try {
            // Read legacy .sync-meta.json
            const metaPath = join(packagePath, '.sync-meta.json');
            let legacyMeta: SyncMeta | null = null;

            if (existsSync(metaPath)) {
              const metaContent = readFileSync(metaPath, 'utf-8');
              legacyMeta = JSON.parse(metaContent) as SyncMeta;
            }

            if (!legacyMeta) {
              console.log(`    ⚠️  No .sync-meta.json found, skipping`);
              continue;
            }

            // Generate prefix for flat structure
            const prefix = packageNameToPrefix(packageName);

            const commandUnits: SkillUnit[] = [];
            const skillUnits: SkillUnit[] = [];

            // Migrate files
            for (const fileName of legacyMeta.files) {
              const sourcePath = join(packagePath, fileName);

              if (!existsSync(sourcePath)) {
                console.log(`    ⚠️  File not found: ${fileName}`);
                continue;
              }

              if (assetType === 'commands') {
                // Commands: nested structure, keep original names
                if (!dryRun) {
                  const content = readFileSync(sourcePath, 'utf-8');
                  writeFlatAssetFile(cwd, assetType, fileName, content);
                  console.log(`    ✅ Migrated: ${fileName}`);
                } else {
                  console.log(`    🔍 Would migrate: ${fileName}`);
                }
                commandUnits.push({ name: fileName, isDirectory: false });
              } else {
                // Skills/Agents: flat structure with prefix transformation
                const flatFileName = toFlatFileName(prefix, fileName);

                if (!dryRun) {
                  const content = readFileSync(sourcePath, 'utf-8');
                  writeFlatAssetFile(cwd, assetType, flatFileName, content);
                  console.log(`    ✅ Migrated: ${fileName} → ${flatFileName}`);
                } else {
                  console.log(
                    `    🔍 Would migrate: ${fileName} → ${flatFileName}`,
                  );
                }
                skillUnits.push({
                  name: fileName,
                  isDirectory: false,
                  transformed: flatFileName,
                });
              }
            }

            // Update unified metadata
            const packageInfo: PackageSyncInfo = {
              originalName: packageName,
              version: legacyMeta.version,
              files: {
                commands: assetType === 'commands' ? commandUnits : [],
                skills: assetType === 'skills' ? skillUnits : [],
                agents: [],
              },
            };

            // Preserve existing files from other asset types
            if (unifiedMeta!.packages[prefix]) {
              const existing = unifiedMeta!.packages[prefix];
              if (assetType === 'commands') {
                packageInfo.files.skills = existing.files.skills;
                packageInfo.files.agents = existing.files.agents;
              } else if (assetType === 'skills') {
                packageInfo.files.commands = existing.files.commands;
                packageInfo.files.agents = existing.files.agents;
              } else {
                // assetType === 'agents'
                packageInfo.files.commands = existing.files.commands;
                packageInfo.files.skills = existing.files.skills;
              }
            }

            unifiedMeta = updatePackageInMeta(
              unifiedMeta!,
              prefix,
              packageInfo,
            );

            migratedPackages.push(packageName);

            // Mark directory for cleanup
            legacyDirs.push(packagePath);
          } catch (error) {
            const errorMsg = `Failed to migrate ${packageName}: ${error}`;
            console.error(`    ❌ ${errorMsg}`);
            errors.push(errorMsg);
          }
        }

        // Mark scope directory for cleanup if empty
        legacyDirs.push(scopePath);
      }
    } catch (error) {
      const errorMsg = `Error scanning ${assetType}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
    }
  }

  // Write unified metadata
  if (!dryRun && migratedPackages.length > 0) {
    writeUnifiedSyncMeta(cwd, unifiedMeta!);
    console.log(`\n💾 Updated unified sync metadata`);
  }

  // Clean up legacy directories
  if (!dryRun && legacyDirs.length > 0) {
    console.log(`\n🧹 Cleaning up legacy directories...`);

    for (const legacyDir of legacyDirs) {
      try {
        if (existsSync(legacyDir)) {
          // Check if directory is empty or contains only .sync-meta.json
          const entries = readdirSync(legacyDir);
          const hasOnlyMeta =
            entries.length === 1 && entries[0] === '.sync-meta.json';
          const isEmpty = entries.length === 0;

          if (isEmpty || hasOnlyMeta) {
            rmSync(legacyDir, { recursive: true, force: true });
            console.log(`  ✅ Removed: ${legacyDir}`);
          }
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to remove ${legacyDir}:`, error);
      }
    }
  }

  // Summary
  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Migrated packages: ${migratedPackages.length}`);
  if (errors.length > 0) {
    console.log(`  ❌ Errors: ${errors.length}`);
  }

  if (dryRun) {
    console.log(
      `\n🔍 DRY RUN: No changes were made. Run without --dry-run to apply migration.`,
    );
  } else if (migratedPackages.length > 0) {
    console.log(`\n✨ Migration completed successfully!`);
  }

  return {
    success: errors.length === 0,
    migratedPackages,
    errors: errors.length > 0 ? errors : undefined,
  };
}
