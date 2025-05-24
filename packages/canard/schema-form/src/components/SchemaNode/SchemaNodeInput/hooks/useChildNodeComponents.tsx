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
import { ChildNodeComponent, NodeChildren } from '../type';

export const useChildNodeComponents = (
  node: SchemaNode,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
): ChildNodeComponent[] => {
  const [children, setChildren] = useState<NodeChildren>(node.children);
  useSchemaNodeSubscribe(node, ({ type }) => {
    if (type & NodeEventType.UpdateChildren) setChildren(node.children);
  });

  const cache = useRef(new Map<string, ChildNodeComponent>());
  useOnUnmount(() => {
    cache.current.clear();
  });

  return useMemo(() => {
    if (isTerminalNode(node)) return [];
    const ChildNodeComponents = [] as ChildNodeComponent[];
    for (const { node, isVirtualized, index } of children) {
      if (!node?.key || isVirtualized === true) continue;
      const key = index ? `${node.key}:${index}` : node.key;
      const CachedComponent = cache.current.get(key);
      if (CachedComponent) ChildNodeComponents.push(CachedComponent);
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
        cache.current.set(key, ChildComponent);
        ChildNodeComponents.push(ChildComponent);
      }
    }
    return ChildNodeComponents;
  }, [node, children, NodeProxy]);
};
