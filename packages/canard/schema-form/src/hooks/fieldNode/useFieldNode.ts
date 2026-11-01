import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Nullable } from '@aileron/declare';

import { type FieldNode, isFieldNode } from '@/schema-form/core';
import { useRootNodeContext } from '@/schema-form/providers';

import { subscribeFieldNodePath } from '../utils/fieldNodePath/subscribeFieldNodePath';

/**
 * Resolve node inputs directly and follow the structure traversed by path inputs.
 * @param input - Node object or path string
 * @returns Found node or null
 */
export const useFieldNode = (
  input?: FieldNode | string,
): Nullable<FieldNode> => {
  const rootNode = useRootNodeContext();
  const fixed = isFieldNode(input)
    ? input
    : input === undefined || rootNode.find(input) === rootNode
      ? rootNode
      : undefined;
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (fixed || typeof input !== 'string') return NOOP_FUNCTION;
      return subscribeFieldNodePath(rootNode, input, onStoreChange);
    },
    [fixed, input, rootNode],
  );
  const getSnapshot = useCallback(
    () => fixed ?? rootNode.find(typeof input === 'string' ? input : undefined),
    [fixed, input, rootNode],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
