import React from 'react';
import { Box, Text } from 'ink';

import type { TreeNode } from '@/claude-assets-sync/utils/types.js';

export interface AssetTreeNodeProps {
  node: TreeNode;
  depth: number;
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
 * Single tree node component for asset selection
 */
export const AssetTreeNode: React.FC<AssetTreeNodeProps> = ({
  node,
  depth,
  isSelected,
}) => {
  const indent = '  '.repeat(depth);

  // Disabled nodes (internal files of directory skills) - render dimmed without selection icon
  if (node.disabled) {
    return (
      <Box>
        <Text color={isSelected ? 'cyan' : undefined} dimColor={!isSelected}>
          {indent}      {node.label}
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
    (node.type === 'directory' || node.type === 'skill-directory') && node.children
      ? node.expanded
        ? '▼'
        : '▶'
      : ' ';

  return (
    <Box>
      <Text color={isSelected ? 'cyan' : undefined}>
        {indent}{expandIcon} <Text color={iconColor}>{selectionIcon}</Text> {node.label}
      </Text>
    </Box>
  );
};
