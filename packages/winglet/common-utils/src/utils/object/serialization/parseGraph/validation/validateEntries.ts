import { validateToken } from './validateToken';

/** Validates property tuples and array indexes before graph restoration. */
export function validateEntries(
  entries: unknown,
  count: number,
  length?: number,
): number {
  if (!Array.isArray(entries)) throw new TypeError('Invalid graph entries');
  const keys = new Set<string>();
  for (const entry of entries) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== 'string' ||
      keys.has(entry[0])
    )
      throw new TypeError('Invalid or duplicate graph property');
    const key = entry[0];
    keys.add(key);
    if (
      length !== undefined &&
      (key === 'length' ||
        (String(Number(key) >>> 0) === key &&
          Number(key) < 4294967295 &&
          Number(key) >= length))
    )
      throw new TypeError('Invalid graph array index');
    validateToken(entry[1], count);
  }
  return entries.length;
}
