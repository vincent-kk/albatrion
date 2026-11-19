import { getSymbols } from '../../getSymbols';

/**
 * Enumerate exactly the keys handled by the ordinary recursive clone profile.
 * @param source Ordinary dictionary or intrinsic array at a deep work frame.
 * @returns Enumerable dictionary keys, or present array indices and match metadata.
 */
export function getCloneFrameKeys(source: object): PropertyKey[] {
  if (!Array.isArray(source)) return [...Object.keys(source), ...getSymbols(source)];
  const keys: PropertyKey[] = [];
  for (let index = 0; index < source.length; index++) if (index in source) keys.push(index);
  for (const key of ['index', 'input', 'groups']) if (key in source) keys.push(key);
  return keys;
}
