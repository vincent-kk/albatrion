/** Review-only adaptation of stableSerialize's sorted segment writer and placeholder cache.
 * Map/Set/custom objects remain opaque and shared-vs-copied subtrees are not distinguished.
 * No graph validation, descriptor checks, resource scan, or graph wire is involved.
 */
export function legacyFactory(immutable = false) {
  const persistent = new WeakMap<object, string>();
  const references = new WeakMap<object, string>();
  const symbols = new Map<symbol, string>();
  let next = 0;
  const walk = (input: any, cache: WeakMap<object, string>): string => {
    if (
      input !== null &&
      (typeof input === 'object' || typeof input === 'function')
    ) {
      const cached = cache.get(input);
      if (cached !== undefined) return cached;
      const proto = Object.getPrototypeOf(input);
      if (proto === Date.prototype) {
        const time = Date.prototype.getTime.call(input);
        return time === time
          ? Date.prototype.toISOString.call(input)
          : 'Invalid Date';
      }
      if (proto === RegExp.prototype) return String(input);
      const array = Array.isArray(input);
      const plain = proto === null || proto === Object.prototype;
      const storage = array || plain ? cache : persistent;
      const hit = storage === cache ? undefined : storage.get(input);
      if (hit !== undefined) return hit;
      let result = references.get(input);
      if (result === undefined) {
        result = next++ + '@';
        references.set(input, result);
      }
      storage.set(input, result);
      try {
        if (array) {
          const segments: string[] = [];
          for (let i = 0; i < input.length; i++)
            segments.push(walk(input[i], cache));
          result = '[' + segments.join(',') + ']';
        } else if (plain) {
          const segments: string[] = [];
          const keys = Object.keys(input).sort();
          let key: string | undefined;
          while ((key = keys.pop()) !== undefined)
            segments.push(key + ':' + walk(input[key], cache));
          result = '{' + segments.join('|') + '}';
        }
      } catch (error) {
        storage.delete(input);
        throw error;
      }
      storage.set(input, result);
      return result;
    }
    if (typeof input === 'string') return JSON.stringify(input);
    if (typeof input === 'symbol') {
      let key = symbols.get(input);
      if (key === undefined) {
        key = next++ + '@';
        symbols.set(input, key);
      }
      return key;
    }
    return String(input);
  };
  return (input: unknown) =>
    walk(input, immutable ? persistent : new WeakMap());
}

/** Pure-call cost baseline; factory reuse is measured separately. */
export const legacyFingerprint = (input: unknown): string =>
  legacyFactory()(input);
