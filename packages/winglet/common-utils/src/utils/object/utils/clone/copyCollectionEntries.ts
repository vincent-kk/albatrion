/**
 * Fill a cached collection shell from native slots, bypassing overrides.
 * @param tag Type of both collections.
 * @param source Verified native collection.
 * @param target Shell with native slots and the original prototype.
 * @param limit Maximum copying depth.
 * @param depth Depth of an entry relative to the original root.
 * @param cache Identity cache of the owning traversal.
 * @param replicate Copies an entry with the same depth and cache policy.
 */
export function copyCollectionEntries(
  tag: '[object Map]' | '[object Set]',
  source: object,
  target: object,
  limit: number | undefined,
  depth: number,
  cache: Map<object, unknown>,
  replicate: (
    value: unknown,
    limit: number | undefined,
    depth: number,
    cache: Map<object, unknown>,
  ) => unknown,
): void {
  if (tag === '[object Map]') {
    for (const [key, value] of Map.prototype.entries.call(source))
      Map.prototype.set.call(
        target,
        replicate(key, limit, depth, cache),
        replicate(value, limit, depth, cache),
      );
  } else
    for (const value of Set.prototype.values.call(source))
      Set.prototype.add.call(target, replicate(value, limit, depth, cache));
}
