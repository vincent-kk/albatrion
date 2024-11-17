import { useLayoutEffect } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

import { useTick } from './useTick';

export function useTracker<Node extends SchemaNode>(node: Node | null) {
  const [, update] = useTick();
  useLayoutEffect(() => {
    const unsubscribe: Fn | null =
      typeof node?.subscribe === 'function'
        ? node.subscribe(() => {
            update();
          })
        : null;
    return () => {
      unsubscribe?.();
    };
  }, [node, update]);
}
