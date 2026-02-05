import React from 'react';
import { Box, Text } from 'ink';
import type { PackageSyncInfo } from '@/claude-assets-sync/utils/types.js';

export interface SyncedPackageTreeProps {
  packages: Array<{
    prefix: string;
    packageInfo: PackageSyncInfo;
  }>;
  editMode: boolean;
  onEdit?: () => void;
}

interface TreeNode {
  type: 'package' | 'folder' | 'file';
  label: string;
  depth: number;
  packagePrefix?: string;
  assetType?: string;
  fileName?: string;
}

/**
 * Build tree structure from package data
 */
function buildTree(
  packages: Array<{ prefix: string; packageInfo: PackageSyncInfo }>
): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const { prefix, packageInfo } of packages) {
    // Package node
    nodes.push({
      type: 'package',
      label: `${packageInfo.originalName}@${packageInfo.version}`,
      depth: 0,
      packagePrefix: prefix,
    });

    // Asset type folders
    for (const [assetType, files] of Object.entries(packageInfo.files)) {
      const fileArray = Array.isArray(files) ? files : [];

      if (fileArray.length === 0) continue;

      // Folder node - show asset type only (structure info removed)
      nodes.push({
        type: 'folder',
        label: assetType,
        depth: 1,
        packagePrefix: prefix,
        assetType,
      });

      // File nodes - handle both string[] and FileMapping[]
      for (const file of fileArray) {
        const fileName = typeof file === 'string' ? file : file.transformed;
        nodes.push({
          type: 'file',
          label: fileName,
          depth: 2,
          packagePrefix: prefix,
          assetType,
          fileName,
        });
      }
    }

    // Empty line between packages
    if (packages.indexOf({ prefix, packageInfo }) < packages.length - 1) {
      nodes.push({
        type: 'file',
        label: '',
        depth: 0,
      });
    }
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
              if (node.label === '') {
                return <Text key={index}> </Text>;
              }

              const indent = '  '.repeat(node.depth);
              let icon = '';

              if (node.type === 'folder') {
                icon = node.depth === 1 ? '├── ' : '│   ├── ';
              } else if (node.type === 'file') {
                icon = node.depth === 2 ? '│   ├── ' : '';
              }

              return (
                <Box key={index}>
                  <Text dimColor={node.type === 'file'}>
                    {indent}
                    {icon}
                    {node.label}
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
