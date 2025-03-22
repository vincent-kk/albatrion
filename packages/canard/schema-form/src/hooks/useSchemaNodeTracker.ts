import { useEffect } from 'react';

import { BITMASK_ALL } from '@winglet/common-utils';
import { useTick } from '@winglet/react-utils';

import type { NodeEventType, SchemaNode } from '@/schema-form/core';

/**
 * @description SchemaNode의 모든 event마다 tick을 업데이트합니다.
 * @param node - SchemaNode
 * @returns tick: number
 */
export const useSchemaNodeTracker = <Node extends SchemaNode>(
  node: Node | null,
  tracking: NodeEventType = BITMASK_ALL,
) => {
  const [tick, update] = useTick();
  useEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (tracking & type) update();
    });
    return () => {
      unsubscribe();
    };
  }, [node, tracking, update]);
  return tick;
};
