/**
 * Normalize the legacy root spelling while retaining every non-root pointer.
 * @param dataPath - Validator supplied JSON Pointer.
 * @returns Empty root pointer or the unchanged child pointer.
 */
export const normalizeIssueDataPath = (dataPath: string): string =>
  dataPath === '/' ? '' : dataPath;
