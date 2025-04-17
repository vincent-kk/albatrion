import { useMemo } from 'react';

import { type SchemaNode, isSchemaNode } from '@/schema-form/core';
import { useRootNodeContext } from '@/schema-form/providers';

export const useSchemaNode = (
  input?: SchemaNode | string,
): SchemaNode | null => {
  const { rootNode } = useRootNodeContext();
  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else if (typeof input === 'string') return rootNode.findNode(input);
    else return null;
  }, [input, rootNode]);
  return node;
};
