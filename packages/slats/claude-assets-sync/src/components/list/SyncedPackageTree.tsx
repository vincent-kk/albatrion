import React from 'react';
import { Box, Text } from 'ink';
import type { PackageSyncInfo, SkillUnit } from '@/claude-assets-sync/utils/types.js';

export interface SyncedPackageTreeProps {
  packages: Array<{
    prefix: string;
    packageInfo: PackageSyncInfo;
  }>;
  editMode: boolean;
  onEdit?: () => void;
}

interface TreeNode {
  type: 'package' | 'folder' | 'file' | 'skill-directory';
  label: string;
  depth: number;
  isLastAtDepth: boolean[];
  packagePrefix?: string;
  assetType?: string;
  fileName?: string;
}

/**
 * Generate CLI directory tree prefix from ancestor position info
 */
function getTreePrefix(isLastAtDepth: boolean[]): string {
  let prefix = '';
  const depth = isLastAtDepth.length;

  for (let i = 0; i < depth; i++) {
    if (i === depth - 1) {
      prefix += isLastAtDepth[i] ? '└── ' : '├── ';
    } else {
      prefix += isLastAtDepth[i] ? '    ' : '│   ';
    }
  }

  return prefix;
}

/**
 * Build tree structure from package data with sibling position tracking
 */
function buildTree(
  packages: Array<{ prefix: string; packageInfo: PackageSyncInfo }>
): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const { prefix, packageInfo } of packages) {
    // Package node (depth 0) - no tree prefix
    nodes.push({
      type: 'package',
      label: `${packageInfo.originalName}@${packageInfo.version}`,
      depth: 0,
      isLastAtDepth: [],
      packagePrefix: prefix,
    });

    // Collect non-empty asset types
    const assetEntries = Object.entries(packageInfo.files).filter(
      ([, files]) => Array.isArray(files) && files.length > 0,
    );

    // Asset type folders
    assetEntries.forEach(([assetType, files], folderIndex) => {
      const fileArray = files as SkillUnit[];
      const isLastFolder = folderIndex === assetEntries.length - 1;

      // Folder node
      nodes.push({
        type: 'folder',
        label: assetType,
        depth: 1,
        isLastAtDepth: [isLastFolder],
        packagePrefix: prefix,
        assetType,
      });

      // Skill unit nodes
      fileArray.forEach((unit, unitIndex) => {
        const displayName = unit.transformed ?? unit.name;
        const isLastUnit = unitIndex === fileArray.length - 1;

        if (unit.isDirectory) {
          nodes.push({
            type: 'skill-directory',
            label: displayName,
            depth: 2,
            isLastAtDepth: [isLastFolder, isLastUnit],
            packagePrefix: prefix,
            assetType,
            fileName: displayName,
          });
        } else {
          nodes.push({
            type: 'file',
            label: displayName,
            depth: 2,
            isLastAtDepth: [isLastFolder, isLastUnit],
            packagePrefix: prefix,
            assetType,
            fileName: displayName,
          });
        }
      });
    });
  }

  return nodes;
}

/**
 * Synced package tree component
 */
export const SyncedPackageTree: React.FC<SyncedPackageTreeProps> = ({
  packages,
  editMode,
}) => {
  const nodes = buildTree(packages);

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="cyan" paddingX={1}>
        <Box flexDirection="column" width="100%">
          {/* Header */}
          <Box>
            <Text bold color="cyan">
              Synced Packages
            </Text>
          </Box>

          <Box borderStyle="single" borderColor="gray" marginY={1} />

          {/* Tree content */}
          <Box flexDirection="column" paddingY={1}>
            {nodes.map((node, index) => {
              const treePrefix = getTreePrefix(node.isLastAtDepth);
              const label = node.type === 'skill-directory' ? `${node.label}/` : node.label;

              return (
                <Box key={index}>
                  <Text dimColor={node.type === 'file'}>
                    {treePrefix}{label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          <Box borderStyle="single" borderColor="gray" marginTop={1} />

          {/* Footer */}
          <Box paddingTop={1}>
            <Text dimColor>
              {editMode ? (
                '[d] Delete  [a] Add  [Esc] Cancel  [Enter] Confirm'
              ) : (
                '[e] Edit  [r] Refresh  [q] Quit'
              )}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
