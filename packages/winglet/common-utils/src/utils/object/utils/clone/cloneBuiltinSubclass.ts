import { constructBuiltin } from './constructBuiltin';

/** Recursive copying operation supplied by the owning traversal. */
type Replicate = (
  value: any,
  limit: number | undefined,
  depth: number,
  cache: Map<object, any>,
) => any;

/**
 * Allocate subclass slots outside the ordinary built-in dispatch.
 * @param value Verified Date, RegExp, Map or Set instance.
 * @param prototype Original prototype to retain.
 * @param limit Maximum optional copying depth.
 * @param depth Current object depth.
 * @param cache Cycle cache shared by this traversal.
 * @param replicate Owner's recursive value copying operation.
 * @returns Native slots and supported contents with the original prototype.
 */
export function cloneBuiltinSubclass(
  value: any,
  prototype: object | null,
  limit: number | undefined,
  depth: number,
  cache: Map<object, any>,
  replicate: Replicate,
): any {
  if (value instanceof Date) {
    const result = constructBuiltin(
      Date,
      [Date.prototype.getTime.call(value)],
      prototype,
    );
    cache.set(value, result);
    return result;
  }
  if (value instanceof RegExp) {
    const result = constructBuiltin(
      RegExp,
      [
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'source')!.get!.call(
          value,
        ),
        value.flags,
      ],
      prototype,
    );
    result.lastIndex = value.lastIndex;
    cache.set(value, result);
    return result;
  }
  if (value instanceof Map) {
    const result = constructBuiltin(Map, [], prototype);
    cache.set(value, result);
    for (const [key, item] of Map.prototype.entries.call(value))
      Map.prototype.set.call(
        result,
        replicate(key, limit, depth, cache),
        replicate(item, limit, depth, cache),
      );
    return result;
  }
  const result = constructBuiltin(Set, [], prototype);
  cache.set(value, result);
  for (const key of Set.prototype.values.call(value))
    Set.prototype.add.call(result, replicate(key, limit, depth, cache));
  return result;
}
