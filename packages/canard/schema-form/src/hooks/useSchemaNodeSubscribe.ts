import { useEffect } from 'react';

import { useHandle } from '@winglet/react-utils';

import type { NodeListener, SchemaNode } from '@/schema-form/core';

/**
 * Hook for subscribing to schema node events.
 * @param node - Node to subscribe to
 * @param listener - Event listener function
 */
export const useSchemaNodeSubscribe = <Node extends SchemaNode>(
  node: Node | null,
  listener: NodeListener,
) => {
  const handleListener = useHandle(listener);
  useEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(handleListener);
    return unsubscribe;
  }, [node, handleListener]);
};
