import { useEffect, useMemo } from 'react';

import { useTick } from '@winglet/react-utils';

import type { MethodType, SchemaNode } from '@/schema-form/core';

/**
 * @description SchemaNode의 모든 event마다 tick을 업데이트합니다.
 * @param node - SchemaNode
 * @returns tick: number
 */
export const useSchemaNodeTracker = <Node extends SchemaNode>(
  node: Node | null,
  tracking?: MethodType[],
) => {
  const [tick, update] = useTick();
  const trackingTypeSet = useMemo(
    () => (tracking ? new Set(tracking) : null),
    [tracking],
  );
  useEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(({ type }) => {
      if (trackingTypeSet === null || trackingTypeSet.has(type)) update();
    });
    return () => {
      unsubscribe();
    };
  }, [node, trackingTypeSet, update]);
  return tick;
};
