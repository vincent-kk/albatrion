import { validateToken } from './validateToken';

/** Validates collection tuples and unique SameValueZero keys before restoration. */
export function validateCollection(
  entries: unknown,
  count: number,
  map: boolean,
): number {
  if (!Array.isArray(entries)) throw new TypeError('Invalid graph collection');
  const keys = new Set<string>();
  for (const entry of entries) {
    if (map && (!Array.isArray(entry) || entry.length !== 2))
      throw new TypeError('Invalid graph map entry');
    const token = map ? entry[0] : entry;
    validateToken(token, count);
    if (map) validateToken(entry[1], count);
    const key =
      token[0] === 'number' && token[1] === '-0'
        ? '["number",0]'
        : JSON.stringify(token);
    if (keys.has(key)) throw new TypeError('Duplicate graph collection entry');
    keys.add(key);
  }
  return entries.length;
}
