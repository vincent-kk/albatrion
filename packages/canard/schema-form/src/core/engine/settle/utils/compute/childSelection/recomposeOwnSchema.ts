import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { evaluateGate } from '../../gates/evaluateGate';
import { readAdmittingEntry } from '../../gates/frames/readAdmittingEntry';
import { isChildFrameGate } from '../../gates/isChildFrameGate';
import { composeEntrySchema } from './composeEntrySchema';
import { staticIds } from './staticIds';

/**
 * Recompose an admitted array item's own schema when one of its own decisions changed, without
 * its parent's wheel: it evaluates the item's admission and composes through `composeEntrySchema`,
 * the composition the array's entry selection uses at load and in its wheels.
 * @param node - Live admitted array item whose own non-presence decision may have changed
 * @param context - Current settlement; gate reads use the item's parent as owner, exactly as the
 * parent's entry step would, so both read the same canonical decisions
 * @returns Whether the edge still admits the item; false hands membership back to the parent
 */
export const recomposeOwnSchema = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const parent = node.__parent__;
  if (!parent) return true;
  const entry = readAdmittingEntry(parent, node);
  const ids: number[] = [];
  for (const declaration of entry.declarations) {
    let isAdmitted = true;
    for (const gate of declaration.gates)
      if (
        !evaluateGate(
          gate,
          context,
          parent,
          isChildFrameGate(gate, declaration) ? entry.name : undefined,
        )
      ) {
        isAdmitted = false;
        break;
      }
    if (isAdmitted) ids.push(declaration.id);
  }
  if (ids.length === 0) return false;
  const isFull = ids.length === entry.declarations.length;
  composeEntrySchema(
    parent,
    node,
    entry,
    isFull ? staticIds(entry, parent.blueprintNode) : ids,
    isFull,
    undefined,
    true,
    context,
  );
  return true;
};
