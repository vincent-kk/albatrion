import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Capture a retained child's projection before its first effective-schema change.
 * @param host - Existing branch wheel that owns the child's presence registration
 * @param child - Child whose effective schema is about to change
 * @param retained - Whether the prior or current host shape already holds this child
 * @param context - Settlement-local baselines and hosts awaiting presence comparison
 * @returns Nothing; preserves the first baseline and marks the gated host for comparison
 */
export const captureProjectionBaseline = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  child: Self,
  retained: boolean,
  context: SettlementContext<Self>,
): void => {
  if (!context.hasGates || !retained) return;
  const hosts = (context.projectionBaselines ??= new Map());
  let children = hosts.get(host);
  if (!children) hosts.set(host, (children = new Map()));
  if (!children.has(child))
    children.set(child, { schema: child.schema, emit: child.emit });
  (context.presenceHosts ??= new Set()).add(host);
};
