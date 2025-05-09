import { useMemo } from 'react';

import { type SchemaNode, isSchemaNode } from '@/schema-form/core';
import { useRootNodeContext } from '@/schema-form/providers';

/**
 * 스키마 노드를 가져오는 훅입니다.
 * 노드 인스턴스나 경로를 입력받아 해당 노드를 가져옵니다.
 * @param input - 노드 객체나 경로 문자열
 * @returns 찾은 노드 또는 null
 */
export const useSchemaNode = (
  input?: SchemaNode | string,
): SchemaNode | null => {
  const rootNode = useRootNodeContext();
  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else return rootNode.find(input);
  }, [input, rootNode]);
  return node;
};
