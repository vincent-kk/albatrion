import { useHandle } from '@winglet/react-utils/hook';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { useCallback, useEffect, useState } from 'react';

import { scanPackageAssets } from '@/claude-assets-sync/core/packageScanner.js';
import type {
  AddCommandSelection,
  TreeNode,
} from '@/claude-assets-sync/utils/types.js';

import { TreeSelect } from '../tree/index.js';

export interface AddCommandProps {
  packageName: string;
  local: boolean;
  ref?: string;
  onComplete: (selection: AddCommandSelection) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

type State = 'scanning' | 'selecting' | 'confirming' | 'done' | 'error';

/**
 * Add command flow component
 */
export const AddCommand: React.FC<AddCommandProps> = ({
  packageName,
  local,
  ref,
  onComplete,
  onError,
  onCancel,
}) => {
  const [state, setState] = useState<State>('scanning');
  const [trees, setTrees] = useState<TreeNode[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const handleComplete = useHandle(onComplete);
  const handleError = useHandle(onError);
  const handleCancel = useHandle(onCancel);

  useEffect(() => {
    const scan = async () => {
      try {
        setState('scanning');
        const scanned = await scanPackageAssets(packageName, { local, ref });
        setTrees(scanned);
        setState('selecting');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setState('error');
        handleError(error);
      }
    };

    scan();
  }, [packageName, local, ref, handleError]);

  const handleSubmit = useCallback(
    (selectedTrees: TreeNode[]) => {
      setState('confirming');

      // Extract included and excluded assets
      const includedAssets: Record<string, string[]> = {};
      const excludedAssets: Record<string, string[]> = {};

      for (const tree of selectedTrees) {
        const assetType = tree.label;
        includedAssets[assetType] = [];
        excludedAssets[assetType] = [];

        if (tree.children) {
          extractSelection(
            tree.children,
            includedAssets[assetType],
            excludedAssets[assetType],
          );
        }
      }

      const selection: AddCommandSelection = {
        packageName,
        source: local ? 'local' : 'npm',
        ref,
        includedAssets,
        excludedAssets,
      };

      setState('done');
      handleComplete(selection);
    },
    [packageName, local, ref, handleComplete],
  );

  if (state === 'scanning') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" /> Scanning package assets...
        </Text>
      </Box>
    );
  }

  if (state === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error?.message}</Text>
      </Box>
    );
  }

  if (state === 'selecting') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Select assets to sync from {packageName}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>
            Use ↑/↓ to navigate, Space to toggle, →/← to expand/collapse, Enter
            to confirm, Esc to cancel
          </Text>
        </Box>
        <TreeSelect
          trees={trees}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    );
  }

  if (state === 'confirming' || state === 'done') {
    return (
      <Box>
        <Text color="green">✓ Selection confirmed</Text>
      </Box>
    );
  }

  return null;
};

/**
 * Extract selected and unselected paths from tree
 */
function extractSelection(
  nodes: TreeNode[],
  included: string[],
  excluded: string[],
): void {
  for (const node of nodes) {
    if (node.selected) {
      included.push(node.path);
      // If directory is selected, don't need to list children
    } else {
      excluded.push(node.path);
    }

    // Only recurse if not fully selected/deselected
    if (node.children && hasPartialSelection(node)) {
      extractSelection(node.children, included, excluded);
    }
  }
}

/**
 * Check if node has partial selection (some children selected, some not)
 */
function hasPartialSelection(node: TreeNode): boolean {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  const selectedCount = node.children.filter((c) => c.selected).length;
  return selectedCount > 0 && selectedCount < node.children.length;
}
