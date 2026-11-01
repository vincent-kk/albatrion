import type { Nullable } from '@aileron/declare';

import type { EffectiveSchema } from '../../../blueprint';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';
import type { SettlementContext } from '../../types/settlement';

/** Calculated identities held at entry to one bounded node computation. */
export interface CalculatedSnapshot<Self> {
  local: unknown;
  emit: unknown;
  children: Nullable<readonly Self[]>;
  schema: EffectiveSchema;
  active: boolean;
}

/**
 * Keep pre-wheel identities when a temporary gate baseline settles equally.
 * Non-wheel paths retain references through updateOutput without a snapshot.
 * @param node - Recomputed record whose final values may match the prior commit
 * @param previous - Identities captured before the fixed host start
 * @param context - Changed-node set to trim after a no-op calculation
 * @returns Nothing; restores only equal calculated references
 */
export const preserveReferences = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  previous: CalculatedSnapshot<Self>,
  context: SettlementContext<Self>,
): void => {
  if (sameValue(previous.local, node.local))
    node.local = captureFieldNodeChange(node, 'local', previous.local);
  if (sameValue(previous.emit, node.emit))
    node.emit = captureFieldNodeChange(node, 'emit', previous.emit);
  if (
    previous.children !== node.children &&
    previous.children &&
    node.children &&
    previous.children.length === node.children.length
  ) {
    let unchanged = true;
    for (let index = 0; index < previous.children.length; index++)
      if (previous.children[index] !== node.children?.[index]) {
        unchanged = false;
        break;
      }
    if (unchanged)
      node.children = captureFieldNodeChange(
        node,
        'children',
        previous.children,
      );
  }
  if (
    node.local === previous.local &&
    node.emit === previous.emit &&
    node.children === previous.children &&
    node.schema ===
      (context.originalSchemas.get(node.path) ?? previous.schema) &&
    node.isActive === previous.active &&
    !context.changedRaw.has(node.path) &&
    !context.entered.has(node)
  )
    context.changedNodes.delete(node);
};
