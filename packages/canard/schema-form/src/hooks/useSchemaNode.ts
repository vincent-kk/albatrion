import { useMemo } from 'react';

import { type SchemaNode, isSchemaNode } from '@/schema-form/core';
import { useRootNodeContext } from '@/schema-form/providers';

/**
 * Hook for retrieving schema nodes.
 * Takes a node instance or path and returns the corresponding node.
 * @param input - Node object or path string
 * @returns Found node or null
 */
export const useSchemaNode = (
  input?: SchemaNode | string,
): SchemaNode | null => {
  const rootNode = useRootNodeContext();
  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else return rootNode.find(input);
  }, [input, rootNode]);
  return node;
};
