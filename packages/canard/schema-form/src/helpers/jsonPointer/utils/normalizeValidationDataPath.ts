/**
 * Normalize the validator dataPath slash-only root alias.
 * Unlike a form pointer's empty-name member, a validator dataPath of '/' means root.
 * Validation routing preserves this existing convention and the original issue reference.
 */
export const normalizeValidationDataPath = (pointer: string): string =>
  pointer === '/' ? '' : pointer;
