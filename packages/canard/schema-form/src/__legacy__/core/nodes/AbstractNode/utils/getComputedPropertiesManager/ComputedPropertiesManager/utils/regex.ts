/**
 * Detects simple equality: `dependencies[n] === "value"`
 *
 * Captures: [index, quote, value]
 * @example `dependencies[0] === "active"` → ['0', '"', 'active']
 */
export const SIMPLE_EQUALITY_REGEX =
  /^\s*\(?\s*dependencies\[(\d+)\]\s*\)?\s*===\s*(['"])([^'"]+)\2\s*$/;
