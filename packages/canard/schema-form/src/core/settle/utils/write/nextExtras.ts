import { sameValue } from '../compute/sameValue';

/**
 * Preserve undeclared keys in received order across a whole or partial write.
 * @param previous - Host's current extras object
 * @param input - Interpreted plain object being distributed
 * @param declared - Names owned by blueprint child declarations
 * @param merge - Whether untouched extras remain in the result
 * @returns Reused previous reference, a new extras object, or undefined
 */
export const nextExtras = (
  previous: unknown, input: Record<string, unknown>,
  declared: ReadonlySet<string>, merge: boolean,
): unknown => {
  const result: Record<string, unknown> = {};
  if (merge && previous !== null && typeof previous === 'object')
    for (const name of Object.keys(previous))
      Object.defineProperty(result, name, { value: Reflect.get(previous, name),
        enumerable: true, configurable: true, writable: true });
  for (const name of Object.keys(input)) {
    if (declared.has(name)) continue;
    Object.defineProperty(result, name, { value: Reflect.get(input, name),
      enumerable: true, configurable: true, writable: true });
  }
  const next = Object.keys(result).length ? result : undefined;
  return sameValue(previous, next) ? previous : next;
};
