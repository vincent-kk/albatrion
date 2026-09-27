import { compact } from './compact';

const fallback = Symbol('review-only hash fallback');

/** Review-only FNV-1a-style 32-bit streaming hash. Collisions are explicitly allowed. */
export function hash32(input: any, trusted = false): string {
  let hash = 2166136261;
  let seen: Map<object, number> | undefined;
  let id = 0,
    entries = 0,
    arrayLength = 0;
  const write = (text: string) => {
    for (let i = 0; i < text.length; i++)
      hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  };
  const visit = (value: any, depth: number): void => {
    if (value === null) {
      write('l');
      return;
    }
    switch (typeof value) {
      case 'string':
        write('s' + value.length + ':' + value);
        return;
      case 'number':
        write('n' + (Object.is(value, -0) ? '-0' : value) + ';');
        return;
      case 'undefined':
        write('u');
        return;
      case 'boolean':
        write(value ? 't' : 'f');
        return;
      case 'bigint':
        write('b' + value + ';');
        return;
      case 'object':
        break;
      default:
        throw new TypeError('Unsupported');
    }
    if (depth > 256) throw fallback;
    const previous = seen?.get(value);
    if (previous !== undefined) {
      write('r' + previous + ';');
      return;
    }
    const proto = Object.getPrototypeOf(value);
    const array = proto === Array.prototype && Array.isArray(value);
    if (!array && proto !== null && proto !== Object.prototype) throw fallback;
    const ownKeys = Object.keys(value);
    if (array && value.length > ownKeys.length * 4 + 100) throw fallback;
    if (id >= 100000) throw new TypeError('Node limit');
    (seen ??= new Map()).set(value, id++);
    if (!trusted && Object.getOwnPropertySymbols(value).length)
      throw new TypeError('Symbol');
    if (array) {
      if ((arrayLength += value.length) > 1000000)
        throw new TypeError('Array length');
      write('a' + value.length + '[');
      for (let i = 0; i < value.length; i++) {
        if (trusted) {
          if (!Object.prototype.hasOwnProperty.call(value, i)) {
            write('h');
            continue;
          }
          if (++entries > 1000000) throw new TypeError('Entries');
          visit(value[i], depth + 1);
        } else {
          const descriptor = Object.getOwnPropertyDescriptor(value, i);
          if (!descriptor || !descriptor.enumerable) {
            write('h');
            continue;
          }
          if (!('value' in descriptor)) throw new TypeError('Accessor');
          if (++entries > 1000000) throw new TypeError('Entries');
          visit(descriptor.value, depth + 1);
        }
      }
      write(']');
    } else write(proto === null ? 'z' : 'o');
    write('{');
    let keys = ownKeys;
    if (array) {
      let start = keys.length;
      while (start > 0) {
        const key = keys[start - 1],
          number = Number(key);
        if (String(number >>> 0) === key && number !== 4294967295) break;
        start--;
      }
      keys = keys.slice(start);
    }
    keys.sort();
    for (const key of keys) {
      if (++entries > 1000000) throw new TypeError('Entries');
      write(key.length + ':' + key);
      if (trusted) visit(value[key], depth + 1);
      else {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !('value' in descriptor))
          throw new TypeError('Accessor');
        visit(descriptor.value, depth + 1);
      }
    }
    write('}');
  };
  try {
    write('D');
    visit(input, 0);
  } catch (error) {
    if (error !== fallback) throw error;
    hash = 2166136261;
    write('B' + compact(input, undefined, undefined, trusted));
  }
  return (hash >>> 0).toString(36);
}
