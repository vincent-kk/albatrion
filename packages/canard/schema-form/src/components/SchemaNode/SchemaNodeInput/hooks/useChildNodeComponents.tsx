import { type ComponentType, useMemo, useRef, useState } from 'react';

import {
  useMemorize,
  useOnUnmount,
  useRestProperties,
} from '@winglet/react-utils/hook';

import {
  NodeEventType,
  type SchemaNode,
  isTerminalNode,
} from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../../SchemaNodeProxy';
import type { ChildNodeComponent } from '../type';

const SEPARATOR = '\x1F';

/**
 * Create child node components for the given SchemaNode
 * @param node - SchemaNode
 * @param NodeProxy - SchemaNodeProxy
 * @returns ChildNodeComponent[]
 */
export const useChildNodeComponents = (
  node: SchemaNode,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
): ChildNodeComponent[] => {
  const [children, setChildren] = useState(node.children);
  useSchemaNodeSubscribe(node, ({ type }) => {
    if (type & NodeEventType.UpdateChildren) setChildren(node.children);
  });

  const cache = useRef(new Map<string, ChildNodeComponent>());
  useOnUnmount(() => {
    cache.current.clear();
  });

  return useMemo(() => {
    if (isTerminalNode(node) || !children) return [];
    const ChildNodeComponents: ChildNodeComponent[] = [];
    for (const { salt, virtual, node } of children) {
      if (!node?.key || virtual === true) continue;
      const key = salt === undefined ? node.key : node.key + SEPARATOR + salt;
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
