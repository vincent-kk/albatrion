import { useLayoutEffect } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';

import { useTick } from './useTick';

export function useSchemaNodeTracker<Node extends SchemaNode>(
  node: Node | null,
) {
  const [tick, update] = useTick();
  useLayoutEffect(() => {
    const unsubscribe =
      node && isFunction(node.subscribe)
        ? node.subscribe(() => {
            update();
          })
        : null;
    return () => {
      unsubscribe?.();
    };
  }, [node, update]);
  return tick;
}
