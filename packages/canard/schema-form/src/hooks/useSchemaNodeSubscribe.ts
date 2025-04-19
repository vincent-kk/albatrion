import { useEffect } from 'react';

import { useHandle } from '@winglet/react-utils';

import type { NodeListener, SchemaNode } from '@/schema-form/core';

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
