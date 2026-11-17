import { sameValue } from '../../../utils/compute/sameValue';

/**
 * Preserve the pre-L3-a descriptor-copy algorithm as a differential oracle.
 * @param previous - Extras retained by the preceding commit
 * @param input - Interpreted object supplied by the caller
 * @param declared - Keys excluded from incoming extras
 * @param merge - Whether to retain untouched previous extras
 * @returns Previous extras for equal values, otherwise the copied extras
 */
export const referenceNextExtras = (
  previous: unknown,
  input: Record<string, unknown>,
  declared: ReadonlySet<string>,
  merge: boolean,
): unknown => {
  const result: Record<string, unknown> = {};
  if (merge && previous !== null && typeof previous === 'object')
    for (const name of Object.keys(previous))
      Object.defineProperty(result, name, {
        value: Reflect.get(previous, name),
        enumerable: true,
        configurable: true,
        writable: true,
      });
  for (const name of Object.keys(input)) {
    if (declared.has(name)) continue;
    Object.defineProperty(result, name, {
      value: Reflect.get(input, name),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  const next = Object.keys(result).length ? result : undefined;
  return sameValue(previous, next) ? previous : next;
};
