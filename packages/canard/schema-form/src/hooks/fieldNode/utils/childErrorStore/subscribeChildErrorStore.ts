import type { Nullish } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import { CHILD_ERROR_EVENTS } from './childErrorEvents';
import { readChildErrorSnapshot } from './readChildErrorSnapshot';
import type { ChildErrorStoreState } from './types';

/**
 * Bind one parent/children listener set, preserving unchanged reconnect tokens.
 * @param node - Parent retained in the subscription set for structure changes
 * @param children - Child identities selected by the hook's current render
 * @param state - Private token and last close vector; a new store has no close vector
 * @param listener - React check called for deliveries and same-store reconnects, after attachment
 * @returns Cleanup removing every listener and recording the vector for stable cold reads
 */
export const subscribeChildErrorStore = (
  node: FieldNode,
  children: readonly FieldNode[] | Nullish,
  state: ChildErrorStoreState,
  listener: () => void,
): (() => void) => {
  const revision = readChildErrorSnapshot(node);
  const reconnect = state.closedRevision !== undefined;
  if (!reconnect || revision !== state.closedRevision) {
    state.base = revision;
    state.version = 0;
  }
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
  if (reconnect) listener();
  return () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    state.closedRevision = readChildErrorSnapshot(node);
    state.subscribed = false;
  };
};
