import { useCallback, useContext } from 'react';

import type { SchemaNode } from '@/schema-form/core';

import { RootBindingContext } from './RootBindingContext';
import { useRootNodeContext } from './useRootNodeContext';

/** Check the current root at invocation time, including the same stack as reset. */
export const useLiveNode = (node: SchemaNode) => {
  const binding = useContext(RootBindingContext);
  const rootFromContext = useRootNodeContext();
  return useCallback(
    () =>
      !binding ||
      (binding.current.root ?? rootFromContext).find(node.path) === node,
    [binding, rootFromContext, node],
  );
};
