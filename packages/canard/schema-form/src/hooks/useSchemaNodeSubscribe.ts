import { useEffect } from 'react';

import { useHandle } from '@winglet/react-utils';

import type { NodeListener, SchemaNode } from '@/schema-form/core';

/**
 * 스키마 노드의 이벤트를 구독하는 훅입니다.
 * @param node - 구독할 노드
 * @param listener - 이벤트 리스너 함수
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
