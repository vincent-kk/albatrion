import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { rewriteCoveringDistributions } from '../input/rewriteCoveringDistributions';
import { writeSlotPath } from '../slots/writeSlotPath';
import { recordExitInput } from '../source/recordExitInput';
import { findDepartingOwner } from './findDepartingOwner';

/**
 * Place a declarative value at an address that has no live node when the write is applied; the one
 * place every such write lands (WRITE-079). At or below a node leaving in this settlement the value
 * waits in the departing record, which the revival of that node or its final exit applies. Any other
 * inactive address takes the value in its slot, and the settlement's distributions that cover the
 * address carry it, so a later compute does not replay an earlier caller value or lower winner.
 * @param context - Settlement applying the write
 * @param path - Absolute data address the write names
 * @param template - Kind that interprets the value at the address
 * @param value - Value the write names; undefined names nothing at an inactive address
 * @param order - Original application rank when routing a returning candidate
 * @returns Nothing; slot, distribution and departing changes are recorded for rollback
 */
export const placeDeclarativeValue = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  value: unknown,
  order?: number,
): void => {
  if (value === undefined) return;
  const owner = findDepartingOwner(context.root, path, context);
  if (owner) {
    recordExitInput(owner.node, owner.suffix, template, value, context, order);
    return;
  }
  writeSlotPath(
    context.root,
    path,
    template,
    value,
    true,
    context,
    false,
    false,
    true,
  );
  rewriteCoveringDistributions(context, path, value);
};
