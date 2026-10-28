import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { FieldNodeRecord } from '../../../record';
import type { InactiveValueResolver } from '../../../types/controls';

/**
 * Register a synchronous retained-value resolver for one public node lifetime.
 * @param node - Instance whose normal retained gate exit is observed
 * @param listener - Previous-commit resolver; undefined permits declaration fallback
 * @returns Idempotent cleanup; disposed trees accept no registrations
 */
export const onInactiveFieldNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  listener: InactiveValueResolver<unknown>,
): (() => void) => {
  if (node.disposed || node.rootNode.disposed) return NOOP_FUNCTION;
  const runtime = node.runtime;
  const listeners = runtime.inactiveListeners ??= new Map();
  const subscriptions = listeners.get(node) ?? new Set();
  subscriptions.add(listener);
  listeners.set(node, subscriptions);
  return () => {
    subscriptions.delete(listener);
    if (!subscriptions.size) listeners.delete(node);
  };
};
