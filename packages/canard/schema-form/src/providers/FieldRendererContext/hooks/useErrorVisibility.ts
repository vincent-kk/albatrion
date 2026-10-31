import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import {
  type FieldNode,
  isFieldNodeValidationPending,
  readFieldNodeRevealBaseline,
  readFieldNodeShowErrorBaseline,
  subscribeFieldNodeValidationSettled,
} from '@/schema-form/core';

import { resolveErrorVisibility } from '../utils/resolveErrorVisibility';
import { useFieldRendererContext } from './useFieldRendererContext';

const serverSnapshot = () => false;

/** Compute display eligibility solely from engine baselines and the external-store pending snapshot.
 * @param nodes - Same-tree entries for this display; no React lifetime memory is retained.
 * @param conditions - Live display-policy conditions.
 * @param includeEnabled - Renderer/input include enabled; the child-error contract does not.
 * @returns Effective visibility for each entry, preserving input indices. */
export const useErrorVisibility = (
  nodes: readonly (FieldNode | null | undefined)[],
  conditions: readonly boolean[],
  includeEnabled = true,
): boolean[] => {
  const { checkShowError, resolveShowError } = useFieldRendererContext();
  const node = nodes.find((item) => item != null);
  const policy = node ? readFieldNodeShowErrorBaseline(node) : undefined;
  const checkBaseline = policy
    ? resolveShowError(policy.value)
    : checkShowError;
  const live = nodes.map(
    (item, index) =>
      !!item && conditions[index] && (!includeEnabled || item.enabled),
  );
  const baseline = nodes.map((item) => {
    if (!item) return false;
    const before = readFieldNodeRevealBaseline(item);
    return (
      checkBaseline(before?.state ?? item.state) &&
      (!includeEnabled || (before?.enabled ?? item.enabled))
    );
  });
  const candidate = live.some(
    (eligible, index) => eligible && !baseline[index],
  );
  const snapshot = useCallback(
    () => !!node && candidate && isFieldNodeValidationPending(node),
    [node, candidate],
  );
  // React owns subscription setup; this callback checks pending only at setup, never directly in render.
  const subscribe = (listener: () => void) =>
    snapshot() && node
      ? subscribeFieldNodeValidationSettled(node, listener)
      : NOOP_FUNCTION;
  const pending = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return live.map((eligible, index) =>
    resolveErrorVisibility(eligible, baseline[index], pending),
  );
};
