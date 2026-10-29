import type { Optional } from '@aileron/declare';

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
  decisions: Optional<readonly { layer: DeclarationLayer; clear: boolean }[]>,
  inherited: boolean,
): boolean => {
  for (const layer of EXIT_LAYERS) {
    let matching: Optional<{ layer: DeclarationLayer; clear: boolean }[]>;
    {
      const items = decisions;
      if (items != null) {
        const result: Array<(typeof items)[number]> = [];
        for (let index = 0, count = items.length; index < count; index++) {
          const decision = items[index];

          {
            if (decision.layer === layer) result.push(decision);
          }
        }
        matching = result;
      }
    }

    if (matching?.length) {
      for (let index = 0, count = matching.length; index < count; index++) {
        const decision = matching[index];

        if (!decision.clear) {
          return false;
        }
      }
      return true;
    }
  }
  return inherited;
};
