import {
  type ComponentType,
  type MemoExoticComponent,
  type RefObject,
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

import { DeferredFieldProxy } from '@/schema-form/components/FieldProxy/components/DeferredFieldProxy';
import type { FieldProxyProps } from '@/schema-form/components/FieldProxy/type';
import { type FieldNode, isTerminalNode } from '@/schema-form/core';
import { useVirtualizationContext } from '@/schema-form/providers';
import type { ChildFieldProps } from '@/schema-form/types';

import type { AdditionalChildNodeProperties, ChildField } from '../type';

/**
 * Create child fields for the given FieldNode
 * @param node - FieldNode
 * @param NodeProxy - FieldProxy
 * @param mountedChildren - Count of committed child proxies, kept by each child's layout effect
 * @param terminalChildren - List from `useTerminalChildren`, returned as is for terminal nodes and empty branches
 * @returns ChildField[]
 *
 * @remarks `node.children` is read during render and kept consistent by the
 *          input's combined `useSyncExternalStore` tracker, so
 *          `UpdateChildren` deliveries landing between render and commit
 *          (concurrent mount gap) still force a resync render instead of
 *          being lost.
 */
export const useChildFields = (
  node: FieldNode,
  NodeProxy: ComponentType<FieldProxyProps>,
  mountedChildren: RefObject<number>,
  terminalChildren: ChildField[],
): ChildField[] => {
  const children = node.children;

  const { manager } = useVirtualizationContext();

  const cache = useLazyConstant(() => new Map<FieldNode, ChildField>());
  useOnUnmount(() => cache.clear());

  return useMemo(() => {
    if (isTerminalNode(node) || children === null) return terminalChildren;
    const gateManager = manager?.forBranch(children.length) ?? null;
    const ChildFields: ChildField[] = [];
    for (const node of children) {
      const key = String(cache.size);
      const CachedComponent = cache.get(node);
      if (CachedComponent) {
        CachedComponent.path = node.path;
        CachedComponent.field = node.name;
        ChildFields.push(CachedComponent);
      } else {
        // Deferrable is baked at creation so the component's hook set stays
        // static; revealed-ness itself is resolved dynamically by the gate.
        const deferredManager =
          manager?.forChild(gateManager === null ? 0 : ChildFields.length, node) ??
          null;
        const ChildComponent = memo(
          ({
            FieldRenderer: InputFieldRenderer,
            onChange,
            onFileAttach,
            ...restProps
          }: ChildFieldProps) => {
            useLayoutEffect(() => {
              mountedChildren.current++;
              return () => {
                mountedChildren.current--;
              };
            }, []);
            const onChangeRef = useReference(onChange);
            const onFileAttachRef = useReference(onFileAttach);
            const overridePropsRef = useReference(restProps);
            const FieldRenderer = useConstant(InputFieldRenderer);
            return deferredManager !== null ? (
              <DeferredFieldProxy
                node={node}
                manager={deferredManager}
                NodeProxy={NodeProxy}
                onChangeRef={onChangeRef}
                onFileAttachRef={onFileAttachRef}
                overridePropsRef={overridePropsRef}
                FieldRenderer={FieldRenderer}
              />
            ) : (
              <NodeProxy
                node={node}
                onChangeRef={onChangeRef}
                onFileAttachRef={onFileAttachRef}
                overridePropsRef={overridePropsRef}
                FieldRenderer={FieldRenderer}
              />
            );
          },
        ) as MemoExoticComponent<ChildField> & AdditionalChildNodeProperties;

        ChildComponent.key = key;
        ChildComponent.path = node.path;
        ChildComponent.field = node.name;

        cache.set(node, ChildComponent);
        ChildFields.push(ChildComponent);
      }
    }
    return ChildFields;
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
