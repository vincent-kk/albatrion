import { constructBuiltin } from './constructBuiltin';

/** Recursive cloning callback supplied by the owning clone traversal. */
type Replicate = (
  value: any,
  limit: number | undefined,
  depth: number,
  cache: Map<object, any>,
) => any;

/**
 * Fill a subclass shell without merging its allocation site into ordinary arrays.
 * @param value Original subclass array.
 * @param prototype Verified source prototype.
 * @param limit Optional cloning depth limit.
 * @param depth Current traversal depth.
 * @param cache Existing cycle cache.
 * @param replicate Owner's recursive copying operation.
 * @returns Native array slots with the original prototype and supported match metadata.
 */
export function cloneArraySubclass(
  value: any[],
  prototype: object | null,
  limit: number | undefined,
  depth: number,
  cache: Map<object, any>,
  replicate: Replicate,
): any[] {
  const result = constructBuiltin(Array, [value.length], prototype);
  cache.set(value, result);
  for (let index = 0; index < value.length; index++)
    if (index in value)
      Object.defineProperty(result, index, {
        value: replicate(value[index], limit, depth, cache),
        writable: true,
        configurable: true,
        enumerable: true,
      });
  if ('index' in value)
    Object.defineProperty(result, 'index', {
      value: value.index,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  if ('input' in value)
    Object.defineProperty(result, 'input', {
      value: value.input,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  if ('groups' in value)
    Object.defineProperty(result, 'groups', {
      value: replicate(value.groups, limit, depth, cache),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  return result;
}
