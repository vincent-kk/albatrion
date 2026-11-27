/**
 * Apply the controls wording of CREATE_DYNAMIC_FUNCTION to source from a revision that still says "computed property".
 * Only the message text changed, so a pinned revision reworded this way produces the same errors as the working tree.
 * @param text - TypeScript source from the pinned revision
 * @returns The same source with the error text written in the current wording
 */
export const rewordControlsMessages = (text: string): string =>
  text
    .replace(
      'Failed to create dynamic function for computed property.',
      'Failed to create dynamic function for a controls expression.',
    )
    .replace(
      'syntax error in the computed property expression.',
      'syntax error in the controls expression.',
    );
