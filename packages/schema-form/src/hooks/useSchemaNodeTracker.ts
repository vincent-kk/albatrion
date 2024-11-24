import { useLayoutEffect } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

import { useTick } from './useTick';

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
