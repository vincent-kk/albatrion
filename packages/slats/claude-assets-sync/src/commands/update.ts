/**
 * Update command - update package metadata in .sync-meta.json
 */
import pc from 'picocolors';

import {
  buildSkillUnitsFromTree,
  scanPackageAssets,
} from '@/claude-assets-sync/core/packageScanner';
import { syncPackage } from '@/claude-assets-sync/core/sync';
import {
  readUnifiedSyncMeta,
  updatePackageFilesystemMeta,
  updatePackageVersion,
  writeUnifiedSyncMeta,
} from '@/claude-assets-sync/core/syncMeta';
import { SCHEMA_VERSIONS } from '@/claude-assets-sync/core/constants';
import { logger } from '@/claude-assets-sync/utils/logger';
import {
  findGitRoot,
  readLocalPackageJson,
  readPackageJson,
} from '@/claude-assets-sync/utils/package';
import { packageNameToPrefix } from '@/claude-assets-sync/utils/packageName';

export interface UpdateCommandOptions {
  package?: string;
  local?: boolean;
  ref?: string;
  dryRun?: boolean;
  sync?: boolean;
}

/**
 * Run the update command
 * @param options - Update command options
 * @param cwd - Current working directory
 */
export const runUpdateCommand = async (
  options: UpdateCommandOptions,
  cwd: string = process.cwd(),
): Promise<void> => {
  const destDir = findGitRoot(cwd) ?? cwd;

  // Read unified sync metadata
  const meta = readUnifiedSyncMeta(destDir);

  if (!meta || Object.keys(meta.packages).length === 0) {
    logger.info('No packages synced yet. Use "sync" or "add" first.');
    return;
  }

  // Determine which packages to update
  const packagesToUpdate: string[] = [];

  if (options.package) {
    const prefix = packageNameToPrefix(options.package);
    if (!meta.packages[prefix]) {
      logger.error(`Package ${options.package} is not synced.`);
      process.exit(1);
      return;
    }
    packagesToUpdate.push(prefix);
  } else {
    // Update all synced packages
    packagesToUpdate.push(...Object.keys(meta.packages));
  }

  let updatedMeta = { ...meta };
  let hasChanges = false;

  for (const prefix of packagesToUpdate) {
    const packageInfo = updatedMeta.packages[prefix];
    const packageName = packageInfo.originalName;

    console.log(pc.cyan(`\nUpdating ${packageName}...`));

    // Step 1: Read current package.json to get installed version
    const isLocal = options.local ?? packageInfo.local ?? false;
    const currentPkgInfo = isLocal
      ? readLocalPackageJson(packageName, cwd)
      : readPackageJson(packageName, cwd);

    if (!currentPkgInfo) {
      const location = isLocal ? 'workspace' : 'node_modules';
      console.log(pc.yellow(`  ⚠ Package not found in ${location}, skipping version update`));
    } else {
      // Step 2: Update version if changed
      const newVersion = currentPkgInfo.version;
      if (newVersion !== packageInfo.version) {
        if (options.dryRun) {
          console.log(pc.gray(`  [DRY RUN] Would update version: ${packageInfo.version} → ${newVersion}`));
        } else {
          updatedMeta = updatePackageVersion(updatedMeta, prefix, newVersion);
          console.log(pc.green(`  ✓ Version updated: ${packageInfo.version} → ${newVersion}`));
          hasChanges = true;
        }
      } else {
        console.log(pc.gray(`  Version unchanged: ${packageInfo.version}`));
      }
    }

    // Step 3: Update filesystem metadata (scan actual skill units)
    try {
      const scannedTrees = await scanPackageAssets(packageName, {
        local: isLocal,
        ref: options.ref,
        cwd,
      });

      if (scannedTrees && scannedTrees.length > 0) {
        for (const assetTypeTree of scannedTrees) {
          const assetType = assetTypeTree.label;
          const scannedUnits = buildSkillUnitsFromTree(assetTypeTree, prefix);
          const currentUnits = packageInfo.files[assetType] || [];

          // Compare scanned vs current
          const scannedNames = new Set(scannedUnits.map((u) => u.name));
          const currentNames = new Set(currentUnits.map((u) => u.name));

          const added = scannedUnits.filter((u) => !currentNames.has(u.name));
          const removed = currentUnits.filter((u) => !scannedNames.has(u.name));
          const unchanged = currentUnits.filter((u) => scannedNames.has(u.name));

          if (added.length > 0 || removed.length > 0) {
            // Merge: keep current selection, add new, warn about removed
            const mergedUnits = [...unchanged, ...added];

            if (options.dryRun) {
              if (added.length > 0) {
                console.log(pc.gray(`  [DRY RUN] ${assetType}: ${added.length} new skill(s) found`));
                for (const u of added) {
                  console.log(pc.gray(`    + ${u.name}${u.isDirectory ? '/' : ''}`));
                }
              }
              if (removed.length > 0) {
                console.log(pc.yellow(`  [DRY RUN] ${assetType}: ${removed.length} skill(s) no longer in upstream`));
                for (const u of removed) {
                  console.log(pc.yellow(`    - ${u.name}${u.isDirectory ? '/' : ''}`));
                }
              }
            } else {
              updatedMeta = updatePackageFilesystemMeta(
                updatedMeta,
                prefix,
                assetType,
                mergedUnits,
              );

              if (added.length > 0) {
                console.log(pc.green(`  ✓ ${assetType}: ${added.length} new skill(s) added to meta`));
                for (const u of added) {
                  console.log(pc.green(`    + ${u.name}${u.isDirectory ? '/' : ''}`));
                }
              }
              if (removed.length > 0) {
                console.log(pc.yellow(`  ⚠ ${assetType}: ${removed.length} skill(s) no longer in upstream (kept in meta)`));
                for (const u of removed) {
                  console.log(pc.yellow(`    - ${u.name}${u.isDirectory ? '/' : ''}`));
                }
              }
              hasChanges = true;
            }
          } else {
            // Update internal file lists for directory skills (may have changed)
            let internalChanged = false;
            const refreshedUnits = currentUnits.map((current) => {
              const scanned = scannedUnits.find((s) => s.name === current.name);
              if (scanned && scanned.isDirectory && current.isDirectory) {
                const currentInternal = (current.internalFiles || []).sort().join(',');
                const scannedInternal = (scanned.internalFiles || []).sort().join(',');
                if (currentInternal !== scannedInternal) {
                  internalChanged = true;
                  return { ...current, internalFiles: scanned.internalFiles };
                }
              }
              return current;
            });

            if (internalChanged && !options.dryRun) {
              updatedMeta = updatePackageFilesystemMeta(
                updatedMeta,
                prefix,
                assetType,
                refreshedUnits,
              );
              console.log(pc.green(`  ✓ ${assetType}: internal file lists updated`));
              hasChanges = true;
            } else if (internalChanged && options.dryRun) {
              console.log(pc.gray(`  [DRY RUN] ${assetType}: would update internal file lists`));
            } else {
              console.log(pc.gray(`  ${assetType}: no changes`));
            }
          }
        }
      }
    } catch {
      console.log(pc.yellow(`  ⚠ Could not scan package assets, skipping filesystem update`));
    }

    // Step 4: Optionally re-sync files
    if (options.sync && !options.dryRun) {
      console.log(pc.cyan(`  Syncing files...`));
      try {
        await syncPackage(
          packageName,
          {
            force: true,
            dryRun: false,
            local: isLocal,
            ref: options.ref,
            flat: true,
          },
          cwd,
          packageInfo.exclusions,
          destDir,
        );
        console.log(pc.green(`  ✓ Files synced`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.log(pc.red(`  ✗ Sync failed: ${message}`));
      }
    } else if (options.sync && options.dryRun) {
      console.log(pc.gray(`  [DRY RUN] Would re-sync files`));
    }
  }

  // Write updated metadata
  if (hasChanges && !options.dryRun) {
    updatedMeta.syncedAt = new Date().toISOString();
    updatedMeta.skillUnitFormat = SCHEMA_VERSIONS.SKILL_UNIT_FORMAT;
    writeUnifiedSyncMeta(destDir, updatedMeta);
    console.log(pc.green(`\n✓ Metadata updated`));
  } else if (options.dryRun) {
    console.log(pc.gray(`\n[DRY RUN] No changes written`));
  } else {
    console.log(pc.gray(`\nNo changes needed`));
  }
};
