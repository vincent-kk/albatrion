/**
 * Compute stored state after the key release of one modeled interaction.
 * @param state - Authoritative value, draft, and whether the interaction was interrupted.
 * @returns An interrupted release preserves the most recent stored value.
 */
export const resolveSliderRelease = (state: {
  stored: number | undefined;
  draft: number | undefined;
  interrupted: boolean;
}): number | undefined =>
  state.interrupted ? state.stored : (state.draft ?? state.stored);
