import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import { useErrorRevealSubscription } from '../hooks/useErrorRevealSubscription';

/** Same-render history snapshot and stable owner trigger for a held display. */
interface ErrorRevealSubscriberProps {
  /** Held display node sharing the root release lifetime. */
  node: FieldNode;
  /** Version read by the owner in the same render as the history holding the display. */
  version: number;
  /** Owner's stable re-render trigger. */
  onRelease: Fn;
}

/** Re-render a held display after the engine releases its eligibility history.
 * @param props - Held node, owner's same-render version and stable re-render trigger.
 * @returns Nothing; passive subscription catches releases between owner render and effect, including Activity reconnection. */
export const ErrorRevealSubscriber = ({
  node,
  version,
  onRelease,
}: ErrorRevealSubscriberProps) => {
  useErrorRevealSubscription(node, version, onRelease);
  return null;
};
