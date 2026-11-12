import { useEffect } from 'react';

import {
  type FieldNode,
  readFieldNodeRevealVersion,
  subscribeFieldNodeRevealReleased,
} from '@/schema-form/core';

/**
 * Subscribe only a held display and catch a release between render and passive effect.
 * @param node - Source sharing the form's release lifetime.
 * @param version - Same-render hold version, or undefined when no subscription is needed.
 * @param onRelease - Owner's stable render dispatch.
 * @returns Nothing; cleanup disconnects the old hold before reconnecting or unmounting.
 */
export const useErrorRevealSubscription = (
  node: FieldNode,
  version: number | undefined,
  onRelease: () => void,
): void => {
  useEffect(() => {
    if (version === undefined) return;
    const unsubscribe = subscribeFieldNodeRevealReleased(node, onRelease);
    if (readFieldNodeRevealVersion(node) !== version) onRelease();
    return unsubscribe;
  }, [node, version, onRelease]);
};
