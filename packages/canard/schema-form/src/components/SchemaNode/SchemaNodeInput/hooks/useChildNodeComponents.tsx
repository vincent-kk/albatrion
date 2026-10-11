import {
  type ComponentType,
  type MemoExoticComponent,
  type MutableRefObject,
  memo,
  useLayoutEffect,
  useMemo,
} from 'react';

import {
  useConstant,
  useLazyConstant,
  useOnUnmount,
  useReference,
} from '@winglet/react-utils/hook';

import { DeferrableNodeProxy } from '@/schema-form/components/SchemaNode/DeferrableNodeProxy';
import type { SchemaNodeProxyProps } from '@/schema-form/components/SchemaNode/SchemaNodeProxyProps';
import {
  type SchemaNode,
  SchemaNodeEventType,
  isTerminalNode,
} from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import { useVirtualizationContext } from '@/schema-form/providers';
import type { ChildNodeComponentProps } from '@/schema-form/types';

import type {
  AdditionalChildNodeProperties,
  ChildNodeComponent,
} from '../type';
import { useTerminalChildren } from './useTerminalChildren';

/**
 * Create child node components for the given SchemaNode
 * @param node - SchemaNode
 * @param NodeProxy - SchemaNodeProxy
 * @returns ChildNodeComponent[]
 *
 * @remarks `node.children` is read during render and kept consistent by the
 *          tracker: `useSchemaNodeTracker` is `useSyncExternalStore`-based, so
 *          `UpdateChildren` deliveries landing between render and commit
 *          (concurrent mount gap) still force a resync render instead of
 *          being lost.
 */
export const useChildNodeComponents = (
  node: SchemaNode,
  NodeProxy: ComponentType<SchemaNodeProxyProps>,
  mountedChildren: MutableRefObject<number>,
): ChildNodeComponent[] => {
  useSchemaNodeTracker(
    node,
    SchemaNodeEventType.UpdateChildren | SchemaNodeEventType.UpdatePath,
  );
  const children = node.children;
  const terminalChildren = useTerminalChildren(node);

  const { manager } = useVirtualizationContext();

  const cache = useLazyConstant(
    () => new Map<SchemaNode, ChildNodeComponent>(),
  );
  useOnUnmount(() => cache.clear());

  return useMemo(() => {
    if (isTerminalNode(node) || children === null) return terminalChildren;
    const gateManager = manager?.forBranch(children.length) ?? null;
    const ChildNodeComponents: ChildNodeComponent[] = [];
    for (const node of children) {
      const key = String(cache.size);
      const CachedComponent = cache.get(node);
      if (CachedComponent) {
        CachedComponent.path = node.path;
        CachedComponent.field = node.name;
        ChildNodeComponents.push(CachedComponent);
      } else {
        // Deferrable is baked at creation so the component's hook set stays
        // static; revealed-ness itself is resolved dynamically by the gate.
        const deferredManager =
          gateManager?.forChild(ChildNodeComponents.length, node) ?? null;
        const ChildComponent = memo(
          ({
            FormTypeGroupRenderer: InputFormTypeRenderer,
            onChange,
            onFileAttach,
            ...restProps
          }: ChildNodeComponentProps) => {
            useLayoutEffect(() => {
              mountedChildren.current++;
              return () => {
                mountedChildren.current--;
              };
            }, []);
            const onChangeRef = useReference(onChange);
            const onFileAttachRef = useReference(onFileAttach);
            const overridePropsRef = useReference(restProps);
            const FormTypeGroupRenderer = useConstant(InputFormTypeRenderer);
            return deferredManager !== null ? (
              <DeferrableNodeProxy
                node={node}
                manager={deferredManager}
                NodeProxy={NodeProxy}
                onChangeRef={onChangeRef}
                onFileAttachRef={onFileAttachRef}
                overridePropsRef={overridePropsRef}
                FormTypeGroupRenderer={FormTypeGroupRenderer}
              />
            ) : (
              <NodeProxy
                node={node}
                onChangeRef={onChangeRef}
                onFileAttachRef={onFileAttachRef}
                overridePropsRef={overridePropsRef}
                FormTypeGroupRenderer={FormTypeGroupRenderer}
              />
            );
          },
        ) as MemoExoticComponent<ChildNodeComponent> &
          AdditionalChildNodeProperties;

        ChildComponent.key = key;
        ChildComponent.path = node.path;
        ChildComponent.field = node.name;

        cache.set(node, ChildComponent);
        ChildNodeComponents.push(ChildComponent);
      }
    }
    return ChildNodeComponents;
  }, [
    node,
    children,
    NodeProxy,
    manager,
    cache,
    terminalChildren,
    mountedChildren,
  ]);
};
