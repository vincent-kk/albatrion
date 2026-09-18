import type { FingerprintOptions } from '../type';
import { isOmitted } from './isOmitted';

/** Creates a direct segment writer whose opaque references live within this closure. */
export function createSafeWriter(defaultSort = true) {
  const identities = new WeakMap<object, string>();
  const symbols = new Map<symbol, string>();
  let nextIdentity = 0;
  const identity = (value: object | symbol): string => {
    const store = (typeof value === 'symbol' ? symbols : identities) as Map<
      object | symbol,
      string
    >;
    let key = store.get(value);
    if (key === undefined) {
      key = '@' + nextIdentity++;
      store.set(value, key);
    }
    return key;
  };
  const walk = (
    value: any,
    seen: Map<object, string>,
    omit: FingerprintOptions['omit'],
    sort: boolean,
  ): string => {
    if (value === null) return 'null';
    switch (typeof value) {
      case 'string':
        return JSON.stringify(value);
      case 'number':
        return value === 0 && 1 / value < 0 ? '-0' : '' + value;
      case 'bigint':
        return value + 'n';
      case 'undefined':
        return 'undefined';
      case 'boolean':
        return value ? 'true' : 'false';
      case 'symbol':
      case 'function':
        return identity(value);
    }
    const cached = seen.get(value);
    if (cached !== undefined) return cached;
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Date.prototype)
      return 'Date(' + Date.prototype.getTime.call(value) + ')';
    if (prototype === RegExp.prototype) return String(value);
    const array = Array.isArray(value);
    if (!array && prototype !== null && prototype !== Object.prototype)
      return identity(value);
    seen.set(value, '#' + seen.size);
    let result: string;
    if (array) {
      const segments: string[] = [];
      for (let i = 0; i < value.length; i++) {
        const item = omit && isOmitted(String(i), omit) ? undefined : value[i];
        segments.push(
          item === undefined ? 'undefined' : walk(item, seen, omit, sort),
        );
      }
      result = '[' + segments.join(',') + ']';
    } else {
      const keys = Object.keys(value);
      if (sort) keys.sort();
      const segments: string[] = [];
      let key: string | undefined;
      while ((key = keys.pop()) !== undefined) {
        if (omit && isOmitted(key, omit)) continue;
        segments.push(
          key.length + ':' + key + walk(value[key], seen, omit, sort),
        );
      }
      result = '{' + segments.join('|') + '}';
    }
    seen.set(value, result);
    return result;
  };
  return (
    value: unknown,
    omit?: FingerprintOptions['omit'],
    sort = defaultSort,
  ): string => walk(value, new Map(), omit, sort);
}
