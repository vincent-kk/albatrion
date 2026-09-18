import { checkTextLimit } from '../../serialization/utils/checkTextLimit';
import { compact } from './compact';

const fallback = Symbol('review-only fallback');

/** Plain-object/array direct writer; extended values and deep input use compact fallback. */
export function direct(input: any, trusted = false): string {
  let output = 'D';
  let seen: Map<object, number> | undefined;
  let id = 0,
    entries = 0,
    arrayLength = 0;
  const visit = (value: any, depth: number): void => {
    if (value === null) {
      output += 'l';
      return;
    }
    switch (typeof value) {
      case 'string':
        output += 's' + value.length + ':' + value;
        return;
      case 'number':
        output += 'n' + (Object.is(value, -0) ? '-0' : value) + ';';
        return;
      case 'undefined':
        output += 'u';
        return;
      case 'boolean':
        output += value ? 't' : 'f';
        return;
      case 'bigint':
        output += 'b' + value + ';';
        return;
      case 'object':
        break;
      default:
        throw new TypeError('Unsupported');
    }
    if (depth > 256) throw fallback;
    const previous = seen?.get(value);
    if (previous !== undefined) {
      output += 'r' + previous + ';';
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
      output += 'a' + value.length + '[';
      for (let i = 0; i < value.length; i++) {
        if (trusted) {
          if (!Object.prototype.hasOwnProperty.call(value, i)) {
            output += 'h';
            continue;
          }
          if (++entries > 1000000) throw new TypeError('Entries');
          visit(value[i], depth + 1);
        } else {
          const descriptor = Object.getOwnPropertyDescriptor(value, i);
          if (!descriptor || !descriptor.enumerable) {
            output += 'h';
            continue;
          }
          if (!('value' in descriptor)) throw new TypeError('Accessor');
          if (++entries > 1000000) throw new TypeError('Entries');
          visit(descriptor.value, depth + 1);
        }
      }
      output += ']';
    } else output += proto === null ? 'z' : 'o';
    output += '{';
    let keys = ownKeys;
    if (array) {
      let start = keys.length;
      while (start > 0) {
        const key = keys[start - 1];
        const number = Number(key);
        if (String(number >>> 0) === key && number !== 4294967295) break;
        start--;
      }
      keys = keys.slice(start);
    }
    keys.sort();
    for (const key of keys) {
      if (++entries > 1000000) throw new TypeError('Entries');
      output += key.length + ':' + key;
      if (trusted) visit(value[key], depth + 1);
      else {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor || !('value' in descriptor))
          throw new TypeError('Accessor');
        visit(descriptor.value, depth + 1);
      }
    }
    output += '}';
  };
  try {
    visit(input, 0);
  } catch (error) {
    if (error === fallback) {
      const text = 'B' + compact(input, undefined, undefined, trusted);
      if (!trusted) checkTextLimit(text);
      return text;
    }
    throw error;
  }
  if (!trusted) checkTextLimit(output);
  return output;
}
