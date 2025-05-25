/**
 * Function to check if a value is a symbol
 * @param value - Value to check
 * @returns true if the value is a symbol, false otherwise
 */
export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';
