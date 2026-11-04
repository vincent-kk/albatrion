import { sameValue } from '../../../utils/compute/sameValue';
import { writeObjectKey } from '../../../utils/writeObjectKey';

/**
 * Copy extras with result-key enumeration as the differential reference.
 * @param previous - Previously retained extras
 * @param input - Caller-owned object to distribute
 * @param declared - Keys owned by declared children
 * @param merge - Whether to copy previous extras first
 * @returns Equal previous reference, copied extras, or undefined
 */
export const enumeratingNextExtras = (
  previous: unknown,
  input: Record<string, unknown>,
  declared: ReadonlySet<string>,
  merge: boolean,
): unknown => {
  const result: Record<string, unknown> = {};
  if (merge && previous !== null && typeof previous === 'object')
    for (const name of Object.keys(previous))
      writeObjectKey(result, name, Reflect.get(previous, name));
  for (const name of Object.keys(input)) {
    if (declared.has(name)) continue;
    writeObjectKey(result, name, Reflect.get(input, name));
  }
  const next = Object.keys(result).length ? result : undefined;
  return sameValue(previous, next) ? previous : next;
};
