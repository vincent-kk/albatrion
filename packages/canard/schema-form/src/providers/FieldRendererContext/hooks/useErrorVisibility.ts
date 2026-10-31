import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';
import { useRestProperties } from '@winglet/react-utils/hook';

import {
  type FieldNode,
  isFieldNodeValidationPending,
  subscribeFieldNodeValidationSettled,
} from '@/schema-form/core';

const serverSnapshot = () => false;
const EMPTY_VISIBILITY: ReadonlyMap<FieldNode, boolean> = new Map();

/** Keep newly enabled error displays behind their current write verdict.
 * @param inputNodes - Same-tree occurrences; identity owns committed visibility memory.
 * @param conditions - Existing display-policy decisions, including disabled displays.
 * @param memory - Optional node-specific owner retained across input version remounts.
 * @returns Effective visibility for every occurrence. */
export const useErrorVisibility = (
  inputNodes: readonly (FieldNode | null | undefined)[],
  conditions: readonly boolean[],
  memory?: RefObject<ReadonlyMap<FieldNode, boolean>>,
): boolean[] => {
  const nodes = useRestProperties(inputNodes);
  const owned = useRef(EMPTY_VISIBILITY);
  const committed = memory ?? owned;
  const node = nodes.find((item) => item != null);
  const candidate = nodes.some(
    (item, index) => item && conditions[index] && !committed.current.get(item),
  );
  const snapshot = useCallback(
    () => !!node && candidate && isFieldNodeValidationPending(node),
    [node, candidate],
  );
  const holding = snapshot();
  const subscribe = useCallback(
    (listener: () => void) =>
      holding && node
        ? subscribeFieldNodeValidationSettled(node, listener)
        : NOOP_FUNCTION,
    [node, holding],
  );
  const pending = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const visible = nodes.map(
    (item, index) =>
      !!item &&
      conditions[index] &&
      (!!committed.current.get(item) || !pending),
  );
  const visibility = visible.join(':');
  useLayoutEffect(() => {
    const next = new Map<FieldNode, boolean>();
    nodes.forEach((item, index) => {
      if (item) next.set(item, visible[index]);
    });
    committed.current = next;
    // Visibility bits represent the render values; identity changes also require a commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, visibility, committed]);
  return visible;
};
