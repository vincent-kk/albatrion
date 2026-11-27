import { useCallback, useContext } from 'react';

import type { FieldNode } from '@/schema-form/core';

import { RootBindingContext } from '../components/RootBindingContext';
import { useRootNodeContext } from './useRootNodeContext';

/** Check the current root at invocation time, including the same stack as reset. */
export const useLiveNode = (node: FieldNode) => {
  const binding = useContext(RootBindingContext);
  const rootFromContext = useRootNodeContext();
  return useCallback(
    () =>
      !binding ||
      (binding.current.root ?? rootFromContext).find(node.path) === node,
    [binding, rootFromContext, node],
  );
};
