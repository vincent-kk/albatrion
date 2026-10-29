import type { DeclarationLayer } from '../../../types/controls';

/** Exit policy specificity shared by latent decisions. */
const EXIT_LAYERS = ['node', 'fields', 'fragment'] as const;

/**
 * Resolve a latent occurrence's last-live explicit decisions.
 * @param decisions - Frozen layer decisions captured on the occurrence's exit
 * @param inherited - Policy from the next departing ancestor or Form
 * @returns The nearest layer's unanimous clear, or inherited when undeclared
 */
export const readLatentExitPolicy = (
  decisions: readonly { layer: DeclarationLayer; clear: boolean }[] | undefined,
  inherited: boolean,
): boolean => {
  for (const layer of EXIT_LAYERS) {
    const matching = (() => {
      const items = decisions;
      if (items == null) return undefined;
      const result: Array<(typeof items)[number]> = [];
      iterate: for (
        let index = 0, count = items.length;
        index < count;
        index++
      ) {
        if (!(index in items)) continue;
        const item = items[index];
        const decision = item;
        {
          if (decision.layer === layer) result.push(item);
          continue iterate;
        }
      }
      return result;
    })();
    if (matching?.length)
      return (() => {
        const items = matching;
        for (let index = 0, count = items.length; index < count; index++) {
          if (!(index in items)) continue;
          const decision = items[index];
          if (!decision.clear) return false;
        }
        return true;
      })();
  }
  return inherited;
};
