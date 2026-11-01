import { useEffect } from 'react';

import {
  type FieldNode,
  readFieldNodeRevealVersion,
  subscribeFieldNodeRevealReleased,
} from '@/schema-form/core';

/** Same-render history snapshot and stable owner trigger for a held display. */
interface ErrorRevealSubscriberProps {
  /** Held display node sharing the root release lifetime. */
  node: FieldNode;
  /** Version read by the owner in the same render as the history holding the display. */
  version: number;
  /** Owner's stable re-render trigger. */
  onRelease: () => void;
}

/** Re-render a held display after the engine releases its eligibility history.
 * @param props - Held node, owner's same-render version and stable re-render trigger.
 * @returns Nothing; passive subscription catches releases between owner render and effect, including Activity reconnection. */
export const ErrorRevealSubscriber = ({
  node,
  version,
  onRelease,
}: ErrorRevealSubscriberProps) => {
  useEffect(() => {
    const unsubscribe = subscribeFieldNodeRevealReleased(node, onRelease);
    if (readFieldNodeRevealVersion(node) !== version) onRelease();
    return unsubscribe;
  }, [node, version, onRelease]);
  return null;
};
