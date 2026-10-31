import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import {
  type FieldNode,
  readFieldNodeRevealBaseline,
  readFieldNodeRevealPolicy,
  readFieldNodeRevealVersion,
  subscribeFieldNodeRevealReleased,
} from '@/schema-form/core';

import { resolveErrorVisibility } from '../utils/resolveErrorVisibility';
import { useFieldRendererContext } from './useFieldRendererContext';

/** Shared empty history without per-render allocation. */
const EMPTY_ENTRIES: readonly [] = [];
/** Compute display holds from engine history and subscribe only blocked live candidates.
 * @param nodes - Same-root entries, preserving their display indices.
 * @param conditions - Current eligibility, including checkShowError(state) from this context.
 * @param includeEnabled - Renderer/input include enabled; child-error aggregates do not.
 * @returns Visibility across all unreleased node/policy intervals. */
export const useErrorVisibility = (
  nodes: readonly (FieldNode | null | undefined)[],
  conditions: readonly boolean[],
  includeEnabled = true,
): boolean[] => {
  const { showError } = useFieldRendererContext();
  const node = nodes.find((item) => item != null);
  const policy = node ? readFieldNodeRevealPolicy(node) : undefined;
  const values = nodes.map(
    (item, index) =>
      !!item &&
      resolveErrorVisibility(
        conditions[index],
        item.state,
        item.enabled,
        showError,
        readFieldNodeRevealBaseline(item)?.entries ?? EMPTY_ENTRIES,
        policy,
        includeEnabled,
      ),
  );
  const candidate = nodes.some(
    (item, index) =>
      !!item &&
      conditions[index] &&
      (!includeEnabled || item.enabled) &&
      !values[index],
  );
  const getSnapshot = useCallback(
    () => (node && candidate ? readFieldNodeRevealVersion(node) + 1 : 0),
    [node, candidate],
  );
  const subscribe = useCallback(
    (listener: () => void) => {
      if (!node || !candidate) return NOOP_FUNCTION;
      const unsubscribe = subscribeFieldNodeRevealReleased(node, listener);
      listener();
      return unsubscribe;
    },
    [node, candidate],
  );
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return values;
};
