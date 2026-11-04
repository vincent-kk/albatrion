/**
 * Extracts error message from an error object.
 * @param error - The error object or any value
 * @returns Formatted error message string
 */
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error ?? 'Unknown error');
