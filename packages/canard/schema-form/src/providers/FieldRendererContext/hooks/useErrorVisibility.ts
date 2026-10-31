import {
  useCallback,
  useLayoutEffect,
  useReducer,
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

/** Gate new error reveals using provider-lifetime committed memory.
 * @param inputNodes - Same-tree occurrences rendered by this display.
 * @param conditions - Existing visibility-policy decisions.
 * @param memory - Provider-owned WeakMap for this display kind.
 * @returns Effective visibility; layout rejects a reveal invalidated by a child write. */
export const useErrorVisibility = (
  inputNodes: readonly (FieldNode | null | undefined)[],
  conditions: readonly boolean[],
  memory: WeakMap<FieldNode, boolean>,
): boolean[] => {
  const nodes = useRestProperties(inputNodes);
  const [, resync] = useReducer((value: number) => value + 1, 0);
  const wasVisible = nodes.map((node) => !!node && memory.get(node) === true);
  const node = nodes.find((item) => item != null);
  const candidate = nodes.some(
    (item, index) => item && conditions[index] && !wasVisible[index],
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
      !!item && conditions[index] && (wasVisible[index] || !pending),
  );
  const visibility = visible.join(':');
  useLayoutEffect(() => {
    let rejected = false;
    nodes.forEach((item, index) => {
      if (!item) return;
      const hold =
        !wasVisible[index] &&
        visible[index] &&
        isFieldNodeValidationPending(item);
      memory.set(item, visible[index] && !hold);
      rejected ||= hold;
    });
    if (rejected) resync();
    return () => {
      for (const item of nodes) if (item) memory.delete(item);
    };
    // Previous visibility was captured before an old instance's cleanup; only identity/visible changes commit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, visibility, memory]);
  return visible;
};
