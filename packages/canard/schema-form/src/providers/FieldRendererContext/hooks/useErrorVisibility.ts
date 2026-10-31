import { useCallback, useSyncExternalStore } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import {
  type FieldNode,
  readFieldNodeRevealVersion,
  subscribeFieldNodeRevealReleased,
} from '@/schema-form/core';

import { isErrorRevealed } from '../utils/isErrorRevealed';
import { useFieldRendererContext } from './useFieldRendererContext';

/** Compute aggregate holds from engine history and subscribe only blocked live candidates.
 * @param nodes - Same-root aggregate entries, preserving their display indices.
 * @param conditions - Current aggregate eligibility, including checkShowError(state) from this context.
 * @returns Visibility across all unreleased node/policy intervals, without checking enabled. */
export const useErrorVisibility = (
  nodes: readonly FieldNode[],
  conditions: readonly boolean[],
): boolean[] => {
  const { showError } = useFieldRendererContext();
  const node = nodes[0];
  const values = nodes.map(
    (item, index) =>
      conditions[index] && isErrorRevealed(item, showError, false),
  );
  const candidate = nodes.some(
    (_item, index) => conditions[index] && !values[index],
  );
  // Candidate snapshots stay at 1 or more so a candidate ending is always a snapshot change React keeps.
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
