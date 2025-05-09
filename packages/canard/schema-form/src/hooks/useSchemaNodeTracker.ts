import { useEffect } from 'react';

import { useVersion } from '@winglet/react-utils';

import type { NodeEventType, SchemaNode } from '@/schema-form/core';

import { BIT_MASK_ALL } from '../app/constants/binary';

/**
 * @description SchemaNode의 모든 event마다 tick을 업데이트합니다.
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
