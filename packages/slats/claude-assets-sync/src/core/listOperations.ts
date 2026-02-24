import * as fs from 'node:fs';
import * as path from 'node:path';

import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import {
  removeSkillUnitFromPackage,
  removePackageFromMeta,
  writeUnifiedSyncMeta,
} from '@/claude-assets-sync/core/syncMeta.js';
import type {
  SkillUnit,
  TreeNode,
  UnifiedSyncMeta,
} from '@/claude-assets-sync/utils/types.js';

export type FileOperation =
  | { type: 'add'; prefix: string; assetType: string; skillName: string }
  | { type: 'remove'; prefix: string; assetType: string; skillName: string };

export interface ChangesSummary {
  filesToDelete: string[];
  fileOperations: FileOperation[];
  packagesToSync: Array<{ prefix: string; name: string; local?: boolean }>;
}

export interface PackageFiles {
  [prefix: string]: {
    available: TreeNode[];
    selected: Set<string>;
  };
}

/**
 * Pure computation: given current meta, packageFiles, and selected trees,
 * compute what file operations need to happen.
 * No React state, no side effects.
 */
export function computeFileOperations(
  meta: UnifiedSyncMeta,
  packageFiles: PackageFiles,
  selectedTrees: TreeNode[],
  cwd: string,
): ChangesSummary {
  // Build updated packageFiles selected state from tree
  const newPackageFiles = { ...packageFiles };
  for (const packageTree of selectedTrees) {
    const prefix = packageTree.id;
    if (!newPackageFiles[prefix]) continue;

    const selectedPaths = new Set<string>();

    if (packageTree.children) {
      for (const assetTypeNode of packageTree.children) {
        if (assetTypeNode.children) {
          for (const fileNode of assetTypeNode.children) {
            // Skip disabled nodes (internal files of directory skills)
            if (fileNode.disabled) continue;
            if (fileNode.selected) {
              selectedPaths.add(fileNode.path);
            }
          }
        }
      }
    }

    newPackageFiles[prefix] = {
      ...newPackageFiles[prefix],
      selected: selectedPaths,
    };
  }

  // Collect operations and files to delete
  const fileOperations: FileOperation[] = [];
  const filesToDelete: string[] = [];
  const packagesToSync: Array<{
    prefix: string;
    name: string;
    local?: boolean;
  }> = [];

  for (const [prefix] of Object.entries(meta.packages)) {
    const packageTree = selectedTrees.find((t) => t.id === prefix);
    const packageInfo = meta.packages[prefix];
    const packageData = newPackageFiles[prefix];

    if (!packageTree || !packageTree.selected || !packageData) {
      // Package deselected - remove all files and mark for deletion
      for (const [assetType, files] of Object.entries(packageInfo.files)) {
        if (!Array.isArray(files)) continue;
        const units = files as SkillUnit[];

        // Add remove operations for each skill unit
        for (const unit of units) {
          fileOperations.push({
            type: 'remove',
            prefix,
            assetType,
            skillName: unit.name,
          });
        }

        // Add files to deletion list
        const firstUnit = units[0];
        if (firstUnit?.transformed) {
          // Flat structure
          for (const unit of units) {
            const targetPath = path.join(
              cwd,
              '.claude',
              assetType,
              unit.transformed!,
            );
            filesToDelete.push(targetPath);
          }
        } else {
          // Nested structure
          const dirPath = path.join(
            cwd,
            '.claude',
            assetType,
            packageInfo.originalName,
          );
          filesToDelete.push(dirPath);
        }
      }
      continue;
    }

    let hasChanges = false;

    // Group selected files by asset type
    const selectedByAssetType: Record<string, Set<string>> = {};
    for (const filePath of packageData.selected) {
      const [assetType, fileName] = filePath.split('/');
      if (!selectedByAssetType[assetType]) {
        selectedByAssetType[assetType] = new Set();
      }
      selectedByAssetType[assetType].add(fileName);
    }

    // Check each asset type in meta
    for (const [assetType, originalFiles] of Object.entries(
      packageInfo.files,
    )) {
      const selectedFiles = selectedByAssetType[assetType];
      const units = Array.isArray(originalFiles)
        ? (originalFiles as SkillUnit[])
        : [];
      const firstUnit = units[0];
      const isFlat = !!firstUnit?.transformed;

      if (!selectedFiles || selectedFiles.size === 0) {
        // Asset type deselected - remove all skill units
        hasChanges = true;

        for (const unit of units) {
          fileOperations.push({
            type: 'remove',
            prefix,
            assetType,
            skillName: unit.name,
          });
        }

        // Add to deletion list
        if (isFlat) {
          for (const unit of units) {
            const targetPath = path.join(
              cwd,
              '.claude',
              assetType,
              unit.transformed!,
            );
            filesToDelete.push(targetPath);
          }
        } else {
          const dirPath = path.join(
            cwd,
            '.claude',
            assetType,
            packageInfo.originalName,
          );
          filesToDelete.push(dirPath);
        }
        continue;
      }

      // Find deselected and new skill units
      const originalNames = new Set(units.map((u) => u.name));

      // Check for deselected skills (in original but not in selected)
      for (const unit of units) {
        if (!selectedFiles.has(unit.name)) {
          // Skill was deselected - remove it
          hasChanges = true;
          fileOperations.push({
            type: 'remove',
            prefix,
            assetType,
            skillName: unit.name,
          });

          // Add to deletion list
          if (unit.transformed) {
            const targetPath = path.join(
              cwd,
              '.claude',
              assetType,
              unit.transformed,
            );
            filesToDelete.push(targetPath);
          } else {
            const filePath = path.join(
              cwd,
              '.claude',
              assetType,
              packageInfo.originalName,
              unit.name,
            );
            filesToDelete.push(filePath);
          }
        }
      }

      // Check for new skills (in selected but not in original)
      for (const skillName of selectedFiles) {
        if (!originalNames.has(skillName)) {
          // New skill selected - add it
          hasChanges = true;
          fileOperations.push({
            type: 'add',
            prefix,
            assetType,
            skillName,
          });
        }
      }
    }

    // If there are changes, mark package for sync
    if (hasChanges) {
      packagesToSync.push({
        prefix,
        name: packageInfo.originalName,
        local: packageInfo.local,
      });
    }
  }

  return { filesToDelete, fileOperations, packagesToSync };
}

/**
 * Apply file changes and sync packages.
 * Has side effects (filesystem writes, sync calls) but NO React/ink dependencies.
 */
export async function applyChangesAndSync(
  changesSummary: ChangesSummary,
  meta: UnifiedSyncMeta,
  cwd: string,
  callbacks?: {
    onSyncStart?: () => void;
  },
): Promise<{ updatedMeta: UnifiedSyncMeta; syncErrors: string[] }> {
  const syncErrors: string[] = [];

  // Delete files from filesystem
  for (const filePath of changesSummary.filesToDelete) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ignore errors if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Failed to remove ${filePath}: ${error}`);
      }
    }
  }

  // Apply remove operations only (add operations will be handled by sync)
  let updatedMeta = { ...meta };
  const hasAddOperations = changesSummary.fileOperations.some(
    (op) => op.type === 'add',
  );

  for (const op of changesSummary.fileOperations) {
    if (op.type === 'remove') {
      updatedMeta = removeSkillUnitFromPackage(
        updatedMeta,
        op.prefix,
        op.assetType,
        op.skillName,
      );
    }
    // Skip add operations here - they will be handled by sync
  }

  // Remove packages with no files
  for (const prefix of Object.keys(updatedMeta.packages)) {
    const pkg = updatedMeta.packages[prefix];
    if (!pkg.files || Object.keys(pkg.files).length === 0) {
      updatedMeta = removePackageFromMeta(updatedMeta, prefix);
    }
  }

  // Write updated metadata
  writeUnifiedSyncMeta(cwd, updatedMeta);

  // Sync packages only if there are add operations (new files to download)
  if (hasAddOperations && changesSummary.packagesToSync.length > 0) {
    callbacks?.onSyncStart?.();

    for (const { prefix, name, local } of changesSummary.packagesToSync) {
      try {
        // Build exclusions from removed files
        const removedFiles = changesSummary.fileOperations
          .filter((op) => op.type === 'remove' && op.prefix === prefix)
          .map((op) => `${op.assetType}/${op.skillName}`);

        const exclusions =
          removedFiles.length > 0
            ? { directories: [], files: removedFiles }
            : undefined;

        await syncPackage(
          name,
          {
            force: true, // Force sync to download new files and update meta
            dryRun: false,
            local: local ?? false,
            ref: undefined,
            flat: undefined,
          },
          cwd,
          exclusions,
        );
      } catch (error) {
        const msg = `Failed to sync ${name}: ${error}`;
        console.error(msg);
        syncErrors.push(msg);
      }
    }
  }

  return { updatedMeta, syncErrors };
}
