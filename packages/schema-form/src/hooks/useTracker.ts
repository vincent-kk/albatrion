import { useLayoutEffect } from 'react';

// import type { SchemaNode } from '../nodes';
import { useTick } from './useTick';

export function useTracker(node: any | null) {
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
