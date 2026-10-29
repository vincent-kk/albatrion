import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { verifyGateSelection } from '../../gates/verifyGateSelection';

/**
 * Compare actual generation members with the independent general-path shadow.
 * @param context - Verify-only marked write after ancestor registration
 * @returns Nothing; a mismatch throws before computation consumes either view
 */

export const verifyWriteEpoch = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const shadow = context.writeEpochShadow;
  if (!shadow) return;
  const actual = new Set(context.dirtyPaths);
  const pending = [context.target];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.writeEpoch === context.writeEpoch) actual.add(node.path);
    if (node.children) for (const child of node.children) pending.push(child);
  }
  let matches = actual.size === shadow.size;
  if (matches) {
    matches = true;
    {
      const items = [...shadow];
      for (let index = 0, count = items.length; index < count; index++) {
        const path = items[index];

        if (!actual.has(path)) {
          matches = false;
          break;
        }
      }
    }
  }
  verifyGateSelection(
    matches,
    'S7 write epoch members differ from the general path',
  );
};
