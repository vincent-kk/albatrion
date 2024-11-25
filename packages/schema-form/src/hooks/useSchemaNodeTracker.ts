import { useLayoutEffect } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

import { useTick } from './useTick';

/**
 * @description SchemaNode의 모든 event마다 tick을 업데이트합니다.
 * @param node - SchemaNode
 * @returns tick: number
 */
export function useSchemaNodeTracker<Node extends SchemaNode>(
  node: Node | null,
) {
  const [tick, update] = useTick();
  useLayoutEffect(() => {
    const unsubscribe = node?.subscribe(update);
    return () => {
      unsubscribe?.();
    };
  }, [node, update]);
  return tick;
}
