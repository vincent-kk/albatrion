import { ComponentType, useMemo, useRef, useState } from 'react';

import {
  useMemorize,
  useOnUnmount,
  useRestProperties,
} from '@winglet/react-utils';

import {
  NodeEventType,
  type SchemaNode,
  isTerminalNode,
} from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import { ChildFormTypeInputProps } from '@/schema-form/types';

import { SchemaNodeProxyProps } from '../../SchemaNodeProxy';
import { ChildComponent, NodeChildren } from '../type';

export const useChildNodes = (
  node: SchemaNode,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
): ChildComponent[] => {
  const [children, setChildren] = useState<NodeChildren>(node.children);
  const childComponentBySchemaNodeKey = useRef(
    new Map<string, ChildComponent>(),
  );
  useSchemaNodeSubscribe(node, ({ type }) => {
    if (type & NodeEventType.UpdateChildren) setChildren(node.children);
  });
  useOnUnmount(() => {
    childComponentBySchemaNodeKey.current.clear();
  });

  return useMemo(() => {
    if (isTerminalNode(node)) return [];
    const ChildNodes = [] as ChildComponent[];
    for (const { node, isVirtualized, index } of children) {
      if (!node?.key || isVirtualized === true) continue;
      const key = index ? `${node.key}:${index}` : node.key;
      const CachedComponent = childComponentBySchemaNodeKey.current.get(key);
      if (CachedComponent) ChildNodes.push(CachedComponent);
      else {
        const ChildComponent = ({
          FormTypeRenderer: InputFormTypeRenderer,
          ...restProps
        }: ChildFormTypeInputProps) => {
          const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
          const overrideProps = useRestProperties(restProps);
          return (
            <NodeProxy
              node={node}
              FormTypeRenderer={FormTypeRenderer}
              overrideProps={overrideProps}
            />
          );
        };
        ChildComponent.key = key;
        childComponentBySchemaNodeKey.current.set(key, ChildComponent);
        ChildNodes.push(ChildComponent);
      }
    }
    return ChildNodes;
  }, [node, children, NodeProxy]);
};
