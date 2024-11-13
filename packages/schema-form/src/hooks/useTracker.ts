import { useLayoutEffect } from 'react';

// import type { SchemaNode } from '../nodes';
import { useTick } from './useTick';

export function useTracker(node: any | null) {
  const [, update] = useTick();
  useLayoutEffect(() => {
    if (typeof node?.subscribe === 'function') {
      const unsubscribe = node.subscribe(() => {
        update();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [node, update]);
}
