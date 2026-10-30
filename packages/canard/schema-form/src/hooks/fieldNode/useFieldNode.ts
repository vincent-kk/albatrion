import { useMemo } from 'react';

import type { Nullable } from '@aileron/declare';

import { type FieldNode, isFieldNode } from '@/schema-form/core';
import { useRootNodeContext } from '@/schema-form/providers';

/**
 * Hook for retrieving field nodes.
 * Takes a node instance or path and returns the corresponding node.
 * @param input - Node object or path string
 * @returns Found node or null
 */
export const useFieldNode = (
  input?: FieldNode | string,
): Nullable<FieldNode> => {
  const rootNode = useRootNodeContext();
  const node = useMemo(() => {
    if (isFieldNode(input)) return input;
    else return rootNode.find(input);
  }, [input, rootNode]);
  return node;
};
