/** Exit policy specificity shared by latent decisions. */
const EXIT_LAYERS = ['node', 'children', 'fragment'] as const;

/**
 * Resolve a latent occurrence's last-live explicit decisions.
 * @param decisions - Frozen layer decisions captured on the occurrence's exit
 * @param inherited - Policy from the next departing ancestor or Form
 * @returns The nearest layer's unanimous clear, or inherited when undeclared
 */
export const readLatentExitPolicy = (
  decisions: readonly { layer: 'node' | 'children' | 'fragment';
    clear: boolean }[] | undefined,
  inherited: boolean,
): boolean => {
  for (const layer of EXIT_LAYERS) {
    const matching = decisions?.filter((decision) => decision.layer === layer);
    if (matching?.length) return matching.every((decision) => decision.clear);
  }
  return inherited;
};
