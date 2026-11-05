import type { Nullish } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import { CHILD_ERROR_EVENTS } from './childErrorEvents';
import { readChildErrorSnapshot } from './readChildErrorSnapshot';
import type { ChildErrorStoreState } from './types';

/**
 * Bind one parent/children listener set and publish its current revision base.
 * @param node - Parent retained in the subscription set for structure changes
 * @param children - Child identities selected by the hook's current render
 * @param state - Private store state reset before the listeners are installed
 * @param listener - React notification called after increasing the snapshot version
 * @returns Cleanup removing every listener and restoring cold snapshot reads
 */
export const subscribeChildErrorStore = (
  node: FieldNode,
  children: readonly FieldNode[] | Nullish,
  state: ChildErrorStoreState,
  listener: () => void,
): (() => void) => {
  state.base = readChildErrorSnapshot(node);
  state.version = 0;
  state.subscribed = true;
  const nodes = [node, ...(children ?? [])];
  const unsubscribes = nodes.map((child) =>
    child.subscribe(({ type }) => {
      if (type & CHILD_ERROR_EVENTS) {
        state.version++;
        listener();
      }
    }),
  );
  return () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    state.subscribed = false;
  };
};
