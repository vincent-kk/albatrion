import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { FieldNode } from '@/schema-form/core';

import { readChildErrorSnapshot } from './childErrorStore/readChildErrorSnapshot';
import { subscribeChildErrorStore } from './childErrorStore/subscribeChildErrorStore';
import type { ChildErrorStoreState } from './childErrorStore/types';

/**
 * Own one hook's parent/child error subscription and constant-time live snapshot.
 * @param node - Container whose current errors are read without modifying node state
 * @param children - Render-selected child identities replaced with the hook store
 * @param disabled - Keep cold reads and suppress subscriptions when true
 * @returns React-compatible subscribe and snapshot functions with explicit cleanup
 */
export const createChildErrorStore = (
  node: FieldNode,
  children: readonly FieldNode[] | null | undefined,
  disabled?: boolean,
) => {
  const state: ChildErrorStoreState = {
    base: '',
    version: 0,
    subscribed: false,
  };
  return {
    subscribe: (listener: () => void) =>
      disabled
        ? NOOP_FUNCTION
        : subscribeChildErrorStore(node, children, state, listener),
    getSnapshot: () =>
      state.subscribed
        ? state.version === 0
          ? state.base
          : state.base + '#' + state.version
        : readChildErrorSnapshot(node),
  };
};
