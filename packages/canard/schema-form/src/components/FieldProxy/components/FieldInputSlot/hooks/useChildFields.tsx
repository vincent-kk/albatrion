import {
  type ComponentType,
  type MemoExoticComponent,
  type RefObject,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import {
  useConstant,
  useLazyConstant,
  useReference,
} from '@winglet/react-utils/hook';

import { DeferredFieldProxy } from '@/schema-form/components/FieldProxy/components/DeferredFieldProxy';
import type { FieldProxyProps } from '@/schema-form/components/FieldProxy/type';
import { type FieldNode, isTerminalNode } from '@/schema-form/core';
import { useVirtualizationContext } from '@/schema-form/providers';
import type { ChildFieldProps } from '@/schema-form/types';

import type { AdditionalChildNodeProperties, ChildField } from '../type';

/** The form manager is fixed for this hook's lifetime; no notifications are needed. */
const subscribeNever = () => NOOP_FUNCTION;

/** Server and hydration renders mount every child before enabling client gating. */
const getNoManager = () => null;

/**
 * Create child fields for the given FieldNode
 * @param node - FieldNode
 * @param NodeProxy - FieldProxy
 * @param mountedChildren - Count of committed child proxies, kept by each child's layout effect
 * @param terminalChildren - List from `useTerminalChildren`, returned as is for terminal nodes and empty branches
 * @returns Child fields and an optional ref that the input's existing layout
 *          effect marks true before passive snapshot consistency checks
 *
 * @remarks `node.children` is read during render and kept consistent by the
 *          input's combined `useSyncExternalStore` tracker, so
 *          `UpdateChildren` deliveries landing between render and commit
 *          (concurrent mount gap) still force a resync render instead of
 *          being lost.
 *          Hydration reads a null manager through the server snapshot;
 *          the input's commit keeps the detector's client snapshot null before
 *          passive consistency checks, avoiding a hydration-only re-render.
 *          Real child commits are recorded as revealed so later remounts
 *          cannot replace them with placeholders.
 */
export const useChildFields = (
  node: FieldNode,
  NodeProxy: ComponentType<FieldProxyProps>,
  mountedChildren: RefObject<number>,
  terminalChildren: ChildField[],
): readonly [ChildField[], RefObject<boolean> | undefined] => {
  const children = node.children;

  const { manager: formManager } = useVirtualizationContext();
  const hydratedRef = useRef(false);
  const getSnapshot = useCallback(
    () => (hydratedRef.current || isTerminalNode(node) ? null : formManager),
    [node, formManager],
  );
  const snapshot = useSyncExternalStore(
    subscribeNever,
    getSnapshot,
    getNoManager,
  );
  const cache = useLazyConstant(() => new Map<FieldNode, ChildField>());

  const ChildFields = useMemo(() => {
    if (isTerminalNode(node) || children === null) return terminalChildren;
    const manager = snapshot ?? (hydratedRef.current ? formManager : null);
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
          gateManager?.forChild(ChildFields.length, node) ?? null;
        const revealLedger = deferredManager === null ? formManager : null;
        const ChildComponent = memo(
          ({
            FieldRenderer: InputFieldRenderer,
            onChange,
            onFileAttach,
            ...restProps
          }: ChildFieldProps) => {
            useLayoutEffect(() => {
              mountedChildren.current++;
              revealLedger?.markRevealed(node);
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
    snapshot,
    formManager,
    cache,
    terminalChildren,
    mountedChildren,
  ]);
  return [
    ChildFields,
    snapshot === null && formManager !== null ? hydratedRef : undefined,
  ];
};
