import {
  type ComponentType,
  type MemoExoticComponent,
  memo,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useConstant,
  useOnUnmount,
  useReference,
} from '@winglet/react-utils/hook';

import type { SchemaNodeProxyProps } from '@/schema-form/components/SchemaNode/SchemaNodeProxy';
import {
  NodeEventType,
  type SchemaNode,
  isTerminalNode,
} from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import type { ChildNodeComponentProps } from '@/schema-form/types';

import type {
  AdditionalChildNodeProperties,
  ChildNodeComponent,
} from '../type';

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
    if (isTerminalNode(node) || children === null) return [];
    const ChildNodeComponents: ChildNodeComponent[] = [];
    for (const child of children) {
      const node = child.node;
      if (!node?.schemaPath || child.virtual === true) continue;
      const key = child.nonce ? node.key + child.nonce : node.key;
      const CachedComponent = cache.current.get(key);
      if (CachedComponent) ChildNodeComponents.push(CachedComponent);
      else {
        const ChildComponent = memo(
          ({
            FormTypeRenderer: InputFormTypeRenderer,
            onChange,
            onFileAttach,
            ...restProps
          }: ChildNodeComponentProps) => {
            const onChangeRef = useReference(onChange);
            const onFileAttachRef = useReference(onFileAttach);
            const overridePropsRef = useReference(restProps);
            const FormTypeRenderer = useConstant(InputFormTypeRenderer);
            return (
              <NodeProxy
                node={node}
                onChangeRef={onChangeRef}
                onFileAttachRef={onFileAttachRef}
                overridePropsRef={overridePropsRef}
                FormTypeRenderer={FormTypeRenderer}
              />
            );
          },
        ) as MemoExoticComponent<ChildNodeComponent> &
          AdditionalChildNodeProperties;

        ChildComponent.key = key;
        ChildComponent.path = node.path;
        ChildComponent.field = node.name;

        cache.current.set(key, ChildComponent);
        ChildNodeComponents.push(ChildComponent);
      }
    }
    return ChildNodeComponents;
  }, [node, children, NodeProxy]);
};
