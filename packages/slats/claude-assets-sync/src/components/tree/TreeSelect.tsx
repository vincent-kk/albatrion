import { Box, useInput } from 'ink';
import React, { useState } from 'react';

import type { TreeNode } from '@/claude-assets-sync/utils/types.js';
import { AssetTreeNode } from './AssetTreeNode.js';

export interface TreeSelectProps {
  trees: TreeNode[];
  onSubmit: (trees: TreeNode[]) => void;
  onCancel: () => void;
  onRefresh?: () => void;
}

/**
 * Interactive tree selection component
 */
export const TreeSelect: React.FC<TreeSelectProps> = ({
  trees,
  onSubmit,
  onCancel,
  onRefresh,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [treeData, setTreeData] = useState(trees);

  // Flatten tree for navigation
  const flattenTree = (
    nodes: TreeNode[],
    depth = 0,
  ): Array<{ node: TreeNode; depth: number; path: number[] }> => {
    const result: Array<{ node: TreeNode; depth: number; path: number[] }> = [];

    const traverse = (
      items: TreeNode[],
      currentDepth: number,
      parentPath: number[] = [],
    ) => {
      items.forEach((item, index) => {
        const currentPath = [...parentPath, index];
        result.push({ node: item, depth: currentDepth, path: currentPath });

        if (item.expanded && item.children) {
          traverse(item.children, currentDepth + 1, currentPath);
        }
      });
    };

    traverse(nodes, depth);
    return result;
  };

  const flatItems = flattenTree(treeData);

  useInput((input: string, key: any) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(flatItems.length - 1, prev + 1));
    } else if (key.rightArrow) {
      // Expand directory or skill-directory
      const current = flatItems[selectedIndex];
      if (
        (current.node.type === 'directory' || current.node.type === 'skill-directory') &&
        !current.node.expanded &&
        current.node.children
      ) {
        const newTrees = updateNodeAtPath(treeData, current.path, (node) => ({
          ...node,
          expanded: true,
        }));
        setTreeData(newTrees);
      }
    } else if (key.leftArrow) {
      // Collapse directory or skill-directory
      const current = flatItems[selectedIndex];
      if (
        (current.node.type === 'directory' || current.node.type === 'skill-directory') &&
        current.node.expanded
      ) {
        const newTrees = updateNodeAtPath(treeData, current.path, (node) => ({
          ...node,
          expanded: false,
        }));
        setTreeData(newTrees);
      }
    } else if (input === ' ') {
      // Toggle selection (skip disabled nodes - internal skill files)
      const current = flatItems[selectedIndex];
      if (current.node.disabled) {
        return;
      }
      const newTrees = toggleNodeSelection(treeData, current.path);
      setTreeData(newTrees);
    } else if (input === 'r' && onRefresh) {
      // Refresh
      onRefresh();
    } else if (key.return) {
      // Submit
      onSubmit(treeData);
    } else if (key.escape || input === 'q') {
      // Cancel
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      {flatItems.map((item, index) => (
        <AssetTreeNode
          key={item.path.join('-')}
          node={item.node}
          depth={item.depth}
          isSelected={index === selectedIndex}
          onToggle={() => {
            const newTrees = toggleNodeSelection(treeData, item.path);
            setTreeData(newTrees);
          }}
        />
      ))}
    </Box>
  );
};

/**
 * Update node at specific path
 */
function updateNodeAtPath(
  trees: TreeNode[],
  path: number[],
  updater: (node: TreeNode) => TreeNode,
): TreeNode[] {
  if (path.length === 0) return trees;

  const [index, ...rest] = path;
  const newTrees = [...trees];

  if (rest.length === 0) {
    newTrees[index] = updater(newTrees[index]);
  } else if (newTrees[index].children) {
    newTrees[index] = {
      ...newTrees[index],
      children: updateNodeAtPath(newTrees[index].children!, rest, updater),
    };
  }

  return newTrees;
}

/**
 * Toggle node selection and propagate to children and parents
 */
function toggleNodeSelection(trees: TreeNode[], path: number[]): TreeNode[] {
  // First, toggle the node and its children (downward propagation)
  const updatedTrees = updateNodeAtPath(trees, path, (node) => {
    const newSelected = !node.selected;
    return toggleNodeAndChildren(node, newSelected);
  });

  // Then, update all ancestors (upward propagation)
  return updateAncestors(updatedTrees, path);
}

/**
 * Toggle node and all its children
 */
function toggleNodeAndChildren(node: TreeNode, selected: boolean): TreeNode {
  const newNode = { ...node, selected };

  if (node.children) {
    newNode.children = node.children.map((child) =>
      toggleNodeAndChildren(child, selected),
    );
  }

  return newNode;
}

/**
 * Update ancestor nodes based on their children's selection state
 */
function updateAncestors(trees: TreeNode[], path: number[]): TreeNode[] {
  if (path.length <= 1) {
    // At root level or no parent to update
    return trees;
  }

  // Get parent path (remove last element)
  const parentPath = path.slice(0, -1);

  // Update the parent node based on its children
  const updatedTrees = updateNodeAtPath(trees, parentPath, (parentNode) => {
    if (!parentNode.children || parentNode.children.length === 0) {
      return parentNode;
    }

    // Check if any child is selected
    const anySelected = parentNode.children.some((child) => child.selected);

    return {
      ...parentNode,
      // Parent is selected if any child is selected
      // This will show as:
      // - Fully selected (●) if all children are selected
      // - Partially selected (◐) if some children are selected
      // - Not selected (○) if no children are selected
      selected: anySelected,
    };
  });

  // Recursively update grandparents
  return updateAncestors(updatedTrees, parentPath);
}
