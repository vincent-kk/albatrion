import { useEffect } from 'react';

import { useVersion } from '@winglet/react-utils';

import { BIT_MASK_ALL } from '@/schema-form/app/constants/bitmask';
import type { NodeEventType, SchemaNode } from '@/schema-form/core';

/**
 * @description Updates tick for every SchemaNode event.
 * @param node - SchemaNode
 * @returns tick: number
 */
export const useSchemaNodeTracker = <Node extends SchemaNode>(
  node: Node | null,
  tracking: NodeEventType = BIT_MASK_ALL,
) => {
  const [version, update] = useVersion();
  useEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (type & tracking) update();
    });
    return unsubscribe;
  }, [node, tracking, update]);
  return version;
};
