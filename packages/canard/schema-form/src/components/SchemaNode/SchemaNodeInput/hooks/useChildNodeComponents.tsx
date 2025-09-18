import { type ComponentType, useMemo, useRef, useState } from 'react';

import {
  useConstant,
  useOnUnmount,
  useRestProperties,
} from '@winglet/react-utils/hook';

import type { SchemaNodeProxyProps } from '@/schema-form/components/SchemaNode/SchemaNodeProxy';
import {
  NodeEventType,
  type SchemaNode,
  isTerminalNode,
} from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import type { ChildFormTypeInputProps } from '@/schema-form/types';

import type { ChildNodeComponent } from '../type';

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
  useOnUnmount(() => cache.current.clear());

  return useMemo(() => {
    if (isTerminalNode(node) || !children) return [];
    const ChildNodeComponents: ChildNodeComponent[] = [];
    for (const child of children) {
      const node = child.node;
      if (!node?.schemaPath || child.virtual === true) continue;
      const key = child.nonce
        ? node.schemaPath + child.nonce + '=' + node.name
        : node.schemaPath + '=' + node.name;
      const CachedComponent = cache.current.get(key);
      if (CachedComponent) ChildNodeComponents.push(CachedComponent);
      else {
        const ChildComponent = ({
          FormTypeRenderer: InputFormTypeRenderer,
          ...restProps
        }: ChildFormTypeInputProps) => {
          const FormTypeRenderer = useConstant(InputFormTypeRenderer);
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
