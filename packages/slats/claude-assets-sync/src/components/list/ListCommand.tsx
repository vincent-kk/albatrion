import * as fs from 'node:fs';
import * as path from 'node:path';

import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { scanPackageAssets } from '@/claude-assets-sync/core/packageScanner.js';
import { syncPackage } from '@/claude-assets-sync/core/sync.js';
import {
  readUnifiedSyncMeta,
  removeSkillUnitFromPackage,
  removePackageFromMeta,
  writeUnifiedSyncMeta,
} from '@/claude-assets-sync/core/syncMeta.js';
import type {
  SkillUnit,
  TreeNode,
  UnifiedSyncMeta,
} from '@/claude-assets-sync/utils/types.js';
import { TreeSelect } from '../tree/index.js';

export interface ListCommandProps {
  cwd: string;
}

type State =
  | 'loading'
  | 'selecting'
  | 'confirming'
  | 'saving'
  | 'syncing'
  | 'done';

type FileOperation =
  | { type: 'add'; prefix: string; assetType: string; skillName: string }
  | { type: 'remove'; prefix: string; assetType: string; skillName: string };

interface ChangesSummary {
  filesToDelete: string[];
  fileOperations: FileOperation[];
  packagesToSync: Array<{ prefix: string; name: string; local?: boolean }>;
}

interface PackageFiles {
  [prefix: string]: {
    available: TreeNode[]; // 원격에서 가져온 사용 가능한 파일
    selected: Set<string>; // 현재 선택된 파일 경로
  };
}

/**
 * List command component - interactive tree-based editing of synced files
 */
export const ListCommand: React.FC<ListCommandProps> = ({ cwd }) => {
  const [state, setState] = useState<State>('loading');
  const [packageFiles, setPackageFiles] = useState<PackageFiles>({});
  const [meta, setMeta] = useState<UnifiedSyncMeta | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [changesSummary, setChangesSummary] = useState<ChangesSummary | null>(
    null,
  );
  const hasLoadedRef = useRef(false);

  // Build trees from packageFiles state
  const buildTrees = (): TreeNode[] => {
    if (!meta) return [];

    const trees: TreeNode[] = [];

    for (const [prefix, packageInfo] of Object.entries(meta.packages)) {
      const packageData = packageFiles[prefix];
      if (!packageData) continue;

      // Clone available trees and set selection state
      const assetTypeTrees = packageData.available.map((assetTypeTree) => {
        const clonedTree = { ...assetTypeTree };

        if (clonedTree.children) {
          clonedTree.children = clonedTree.children.map((fileNode) => {
            // Use path for matching (contains original name, not display label)
            const selected = packageData.selected.has(fileNode.path);
            return {
              ...fileNode,
              selected,
            };
          });

          // Update asset type selection state
          const anySelected = clonedTree.children.some((f) => f.selected);
          clonedTree.selected = anySelected;
        }

        return clonedTree;
      });

      trees.push({
        id: prefix,
        label: `${packageInfo.originalName}@${packageInfo.version}`,
        path: packageInfo.originalName,
        type: 'directory' as const,
        children: assetTypeTrees,
        selected: true,
        expanded: true,
      });
    }

    return trees;
  };

  // Load synced files from meta and fetch available files from remote
  const loadSyncedFiles = useCallback(
    async (isRefresh = false) => {
      const loadedMeta = readUnifiedSyncMeta(cwd);

      if (!loadedMeta || Object.keys(loadedMeta.packages).length === 0) {
        setState('done');
        return;
      }

      if (!isRefresh) {
        setMeta(loadedMeta);
      }

      // Get current selected state before updating
      const currentSelected: Record<string, Set<string>> = {};

      setPackageFiles((prev) => {
        // Capture current selected state
        for (const [prefix, data] of Object.entries(prev)) {
          currentSelected[prefix] = data.selected;
        }
        return prev;
      });

      // Fetch all packages in parallel
      const fetchPromises = Object.entries(loadedMeta.packages).map(
        async ([prefix, packageInfo]) => {
          try {
            // Use stored local info if available, otherwise default to local
            const isLocal = packageInfo.local ?? true;
            let scannedTrees = await scanPackageAssets(
              packageInfo.originalName,
              {
                local: isLocal,
                ref: undefined,
              },
            ).catch(() => null);

            // If failed and we don't have local info stored, try the other method
            if (!scannedTrees && packageInfo.local === undefined) {
              scannedTrees = await scanPackageAssets(packageInfo.originalName, {
                local: !isLocal,
                ref: undefined,
              }).catch(() => null);
            }

            if (scannedTrees) {
              return { prefix, available: scannedTrees, packageInfo };
            } else {
              throw new Error('Scan failed, using synced files only');
            }
          } catch {
            // Fallback: create tree from synced files only
            const assetTypeTrees: TreeNode[] = [];

            for (const [assetType, files] of Object.entries(
              packageInfo.files,
            )) {
              const units = Array.isArray(files) ? (files as SkillUnit[]) : [];
              if (units.length === 0) continue;

              const skillNodes: TreeNode[] = units.map((unit) => {
                const displayName = unit.transformed ?? unit.name;

                if (unit.isDirectory) {
                  return {
                    id: `${prefix}/${assetType}/${displayName}`,
                    label: displayName,
                    path: `${assetType}/${unit.name}`,
                    type: 'skill-directory' as const,
                    viewOnly: true,
                    selected: true,
                    expanded: false,
                    children: (unit.internalFiles || []).map((f) => ({
                      id: `${prefix}/${assetType}/${displayName}/${f}`,
                      label: f,
                      path: `${assetType}/${unit.name}/${f}`,
                      type: 'file' as const,
                      selected: true,
                      expanded: false,
                      disabled: true,
                    })),
                  };
                }

                return {
                  id: `${prefix}/${assetType}/${displayName}`,
                  label: displayName,
                  path: `${assetType}/${unit.name}`,
                  type: 'file' as const,
                  selected: true,
                  expanded: false,
                };
              });

              assetTypeTrees.push({
                id: `${prefix}/${assetType}`,
                label: assetType,
                path: assetType,
                type: 'directory' as const,
                children: skillNodes,
                selected: true,
                expanded: true,
              });
            }

            return { prefix, available: assetTypeTrees, packageInfo };
          }
        },
      );

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);

      // Update packageFiles with all results at once
      const newPackageFiles: PackageFiles = {};
      for (const { prefix, available, packageInfo } of results) {
        // Determine selected files from meta (excluding excluded files)
        const excludedFiles = new Set(packageInfo.exclusions?.files || []);

        const metaSelectedFiles = new Set(
          Object.entries(packageInfo.files).flatMap(([assetType, files]) =>
            (Array.isArray(files) ? (files as SkillUnit[]) : [])
              .map((unit) => {
                const filePath = `${assetType}/${unit.name}`;
                if (
                  excludedFiles.has(filePath) ||
                  excludedFiles.has(unit.name)
                ) {
                  return null;
                }
                return filePath;
              })
              .filter((f): f is string => f !== null),
          ),
        );

        // Use existing selected state if refresh, otherwise use meta
        const selectedFiles =
          isRefresh && currentSelected[prefix]
            ? currentSelected[prefix]
            : metaSelectedFiles;

        newPackageFiles[prefix] = {
          available,
          selected: selectedFiles,
        };
      }

      setPackageFiles(newPackageFiles);
      setState('selecting');
    },
    [cwd],
  );

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSyncedFiles().catch((error) => {
        console.error('Failed to load synced files:', error);
        setState('done');
      });
    }
  }, [loadSyncedFiles]);

  // Handle refresh with throttle (30 second cooldown)
  const handleRefresh = () => {
    if (state !== 'selecting') return;

    const now = Date.now();
    if (now - lastRefresh < 30000) {
      // Less than 30 seconds - ignore
      return;
    }
    setLastRefresh(now);
    setState('loading');
    setTimeout(() => {
      loadSyncedFiles(true).catch((error) => {
        console.error('Failed to refresh:', error);
        setState('selecting');
      });
    }, 100);
  };

  // Handle confirmation input
  useInput((input: string) => {
    if (state === 'confirming') {
      if (input === 'y' || input === 'Y') {
        handleConfirm();
      } else if (input === 'n' || input === 'N') {
        handleCancelConfirm();
      }
    }
  });

  const handleSubmit = async (selectedTrees: TreeNode[]) => {
    if (!meta) {
      setState('done');
      process.exit(0);
      return;
    }

    // Update packageFiles selected state from tree
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
    setPackageFiles(newPackageFiles);

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
        const units = Array.isArray(originalFiles) ? (originalFiles as SkillUnit[]) : [];
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
        const originalNames = new Set(
          units.map((u) => u.name),
        );

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

    // Show confirmation screen
    setChangesSummary({ filesToDelete, fileOperations, packagesToSync });
    setState('confirming');
  };

  const handleConfirm = async () => {
    if (!changesSummary || !meta) return;

    setState('saving');

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
      setState('syncing');
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
          console.error(`Failed to sync ${name}: ${error}`);
        }
      }
    }

    setState('done');
    setTimeout(() => process.exit(0), 500);
  };

  const handleCancelConfirm = () => {
    setChangesSummary(null);
    setState('selecting');
  };

  const handleCancel = () => {
    setState('done');
    process.exit(0);
  };

  if (state === 'loading') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Loading synced packages...
        </Text>
      </Box>
    );
  }

  if (state === 'confirming' && changesSummary) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Changes to be applied:</Text>
        </Box>

        {changesSummary.filesToDelete.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="red" bold>
              Files to delete ({changesSummary.filesToDelete.length}):
            </Text>
            {changesSummary.filesToDelete.slice(0, 10).map((filePath) => (
              <Box key={filePath} marginLeft={2}>
                <Text color="red">- {filePath.replace(cwd, '.')}</Text>
              </Box>
            ))}
            {changesSummary.filesToDelete.length > 10 && (
              <Box marginLeft={2}>
                <Text dimColor>
                  ... and {changesSummary.filesToDelete.length - 10} more
                </Text>
              </Box>
            )}
          </Box>
        )}

        {changesSummary.packagesToSync.length > 0 && (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="green" bold>
              Packages to sync ({changesSummary.packagesToSync.length}):
            </Text>
            {changesSummary.packagesToSync.map(({ name }) => (
              <Box key={name} marginLeft={2}>
                <Text color="green">+ {name}</Text>
              </Box>
            ))}
          </Box>
        )}

        {changesSummary.filesToDelete.length === 0 &&
          changesSummary.packagesToSync.length === 0 && (
            <Box marginBottom={1}>
              <Text dimColor>No changes to apply</Text>
            </Box>
          )}

        <Box marginTop={1}>
          <Text bold>Apply changes and sync? (y/n): </Text>
        </Box>
      </Box>
    );
  }

  if (state === 'saving') {
    return (
      <Box>
        <Text color="green">
          <Spinner type="dots" /> Saving changes...
        </Text>
      </Box>
    );
  }

  if (state === 'syncing') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Syncing packages...
        </Text>
      </Box>
    );
  }

  if (
    state === 'done' &&
    (!meta || Object.keys(meta?.packages || {}).length === 0)
  ) {
    return (
      <Box>
        <Text color="yellow">No packages synced yet.</Text>
      </Box>
    );
  }

  if (state === 'selecting') {
    const trees = buildTrees();

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Edit synced packages</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            ↑/↓: navigate • Space: toggle • →/←: expand/collapse • r: refresh
            (30s cooldown) • Enter: save • Esc: cancel
          </Text>
        </Box>
        <TreeSelect
          trees={trees}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onRefresh={handleRefresh}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Text color="green">✓ Changes saved</Text>
    </Box>
  );
};
