import { useCallback, useContext } from 'react';

import type { SchemaNode } from '@/schema-form/core';

import { RootBindingContext } from './RootBindingContext';

/** Check the current root at invocation time, including the same stack as reset. */
export const useLiveNode = (node: SchemaNode) => {
  const binding = useContext(RootBindingContext);
  return useCallback(
    () => !binding || binding.current.root?.find(node.path) === node,
    [binding, node],
  );
};
