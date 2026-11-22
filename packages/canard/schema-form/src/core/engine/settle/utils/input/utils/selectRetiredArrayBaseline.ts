import { visitFieldNodes } from '../../../../navigation';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/** Virtual references do not own storage inside the shortened item. */
const OWNED = { isOwned: true } as const;

/**
 * Select the boundary values of live positions omitted by an automatic fill.
 * @param array - Working array whose count already excludes the omitted positions
 * @param context - Existing source selections for changed bindings inside the array
 * @returns Nothing; a later generation is free to own a new value at the same position
 */
export const selectRetiredArrayBaseline = <Self extends FieldNodeRecord<Self>>(
  array: Self,
  context: SettlementContext<Self>,
): void => {
  const sources = context.retainedSources;
  if (!sources || !array.children) return;
  for (const item of array.children) {
    if (Number(item.name) < array.itemCount) continue;
    visitFieldNodes(
      item,
      (binding) => {
        const source = sources.get(binding);
        if (source) source.shouldUseBaseline = true;
      },
      OWNED,
    );
  }
};
