import { Box, Text } from 'ink';
import React from 'react';

import type { TreeNode } from '@/claude-assets-sync/utils/types.js';

export interface AssetTreeNodeProps {
  node: TreeNode;
  isLastAtDepth: boolean[];
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * Calculate if a directory has partial selection (some children selected, some not)
 */
function hasPartialSelection(node: TreeNode): boolean {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  const selectedCount = node.children.filter((child) => child.selected).length;
  return selectedCount > 0 && selectedCount < node.children.length;
}

/**
 * Generate CLI directory tree prefix from ancestor position info
 */
function getTreePrefix(isLastAtDepth: boolean[]): string {
  let prefix = '';
  const depth = isLastAtDepth.length;

  for (let i = 0; i < depth; i++) {
    if (i === depth - 1) {
      prefix += isLastAtDepth[i] ? '└─ ' : '├─ ';
    } else {
      prefix += isLastAtDepth[i] ? '   ' : '│  ';
    }
  }

  return prefix;
}

/**
 * Single tree node component for asset selection
 */
export const AssetTreeNode: React.FC<AssetTreeNodeProps> = ({
  node,
  isLastAtDepth,
  isSelected,
}) => {
  const treePrefix = getTreePrefix(isLastAtDepth);

  // Disabled nodes (internal files of directory skills) - render dimmed without selection icon
  if (node.disabled) {
    return (
      <Box>
        <Text color={isSelected ? 'cyan' : undefined} dimColor={!isSelected}>
          {treePrefix}
          {node.label}
        </Text>
      </Box>
    );
  }

  // Determine selection icon and color based on state
  let selectionIcon: string;
  let iconColor: string;

  // Check partial selection FIRST (before checking node.selected)
  // because partial selection also has node.selected = true
  if (hasPartialSelection(node)) {
    selectionIcon = '◐'; // Half circle - partial selection
    iconColor = 'yellow';
  } else if (node.selected) {
    selectionIcon = '●'; // Filled circle - fully selected
    iconColor = 'green';
  } else {
    selectionIcon = '○'; // Empty circle - not selected
    iconColor = 'red';
  }

  const expandIcon =
    (node.type === 'directory' || node.type === 'skill-directory') &&
    node.children
      ? node.expanded
        ? '▼'
        : '▶'
      : ' ';

  return (
    <Box>
      <Text color={isSelected ? 'cyan' : undefined}>
        {treePrefix}
        {expandIcon} <Text color={iconColor}>{selectionIcon}</Text> {node.label}
      </Text>
    </Box>
  );
};
