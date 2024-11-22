import { useLayoutEffect } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';

import { useTick } from './useTick';

export function useTracker<Node extends SchemaNode>(node: Node | null) {
  const [, update] = useTick();
  useLayoutEffect(() => {
    const unsubscribe = isFunction(node?.subscribe)
      ? node.subscribe(() => {
          update();
        })
      : null;
    return () => {
      unsubscribe?.();
    };
  }, [node, update]);
}
