import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getEnteredLatentKeys } from './getEnteredLatentKeys';

/** Find a proper latent descendant, excluding sources already owned by live entrants. */
export const hasLatentUnder = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const keys = context.root.runtime.latentRaw.pathIndex.under(path);
  if (!keys.size) return false;
  const entered = getEnteredLatentKeys(context);
  for (const key of keys) {
    if (context.root.runtime.latentRaw.pathIndex.pathOf(key) === path) continue;
    const occurrences = entered.get(key);
    if (
      !occurrences?.some(
        (node) =>
          !node.detached &&
          (!node.parent || node.parent.structure?.[node.name] === node),
      )
    )
      return true;
  }
  return false;
};
