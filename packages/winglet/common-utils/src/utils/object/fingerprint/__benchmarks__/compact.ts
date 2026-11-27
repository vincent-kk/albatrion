import { checkTextLimit } from '../../serialization/utils/checkTextLimit';

/** Review-only compact writer. trusted=true intentionally relaxes input validation. */
export function compact(
  input: unknown,
  options?: { omit?: readonly string[] | ReadonlySet<string>; prefix?: string },
  opaque?: (value: object | symbol) => number,
  trusted = false,
  checkBudget = true,
): string {
  let seen: Map<object, number> | undefined;
  const objects: any[] = [];
  const kinds: number[] = [];
  let entries = 0;
  let arrayLength = 0;
  const omitted = options?.omit;
  const excluded = omitted
    ? Array.isArray(omitted)
      ? (key: string) => omitted.includes(key)
      : (key: string) => (omitted as ReadonlySet<string>).has(key)
    : undefined;
  const str = (value: string): string => value.length + ':' + value;
  const token = (value: any): string => {
    if (value === null) return 'l';
    switch (typeof value) {
      case 'undefined':
        return 'u';
      case 'boolean':
        return value ? 't' : 'f';
      case 'string':
        return 's' + str(value);
      case 'number':
        return 'n' + (Object.is(value, -0) ? '-0' : value) + ';';
      case 'bigint':
        return 'b' + value + ';';
      case 'function':
      case 'symbol':
        if (opaque) return 'x' + opaque(value) + ';';
        throw new TypeError('Unsupported value');
      case 'object': {
        const prior = seen?.get(value);
        if (prior !== undefined) return 'r' + prior + ';';
        const proto = Object.getPrototypeOf(value);
        const kind =
          proto === Object.prototype
            ? 0
            : proto === null
              ? 1
              : proto === Array.prototype && Array.isArray(value)
                ? 2
                : proto === Date.prototype
                  ? 3
                  : proto === Map.prototype
                    ? 4
                    : proto === Set.prototype
                      ? 5
                      : proto === RegExp.prototype
                        ? 6
                        : -1;
        if (kind < 0) {
          if (opaque) return 'x' + opaque(value) + ';';
          throw new TypeError('Unsupported object');
        }
        const id = objects.length;
        if (id >= 100000) throw new TypeError('Node limit');
        (seen ??= new Map()).set(value, id);
        objects.push(value);
        kinds.push(kind);
        return 'r' + id + ';';
      }
      default:
        throw new TypeError('Unsupported value');
    }
  };
  let output = (options?.prefix ?? '') + token(input);
  for (let index = 0; index < objects.length; index++) {
    const value = objects[index];
    const kind = kinds[index];
    if (!trusted && Object.getOwnPropertySymbols(value).length)
      throw new TypeError('Symbol property');
    if (kind <= 2) {
      output +=
        kind === 0 ? 'o{' : kind === 1 ? 'z{' : 'a' + value.length + '{';
      if (kind === 2 && (arrayLength += value.length) > 1000000)
        throw new TypeError('Array length limit');
      const keys = Object.keys(value).sort();
      for (const key of keys) {
        if (excluded?.(key)) continue;
        if (++entries > 1000000) throw new TypeError('Entry limit');
        let item;
        if (trusted) item = value[key];
        else {
          const descriptor = Object.getOwnPropertyDescriptor(value, key);
          if (!descriptor || !('value' in descriptor))
            throw new TypeError('Accessor');
          item = descriptor.value;
        }
        output += str(key) + token(item);
      }
      output += '}';
      continue;
    }
    if (!trusted && Object.keys(value).length)
      throw new TypeError('Builtin property');
    switch (kind) {
      case 3:
        output += 'd' + token(Date.prototype.getTime.call(value));
        break;
      case 4:
        output += 'm{';
        for (const [key, item] of Map.prototype.entries.call(value)) {
          if (++entries > 1000000) throw new TypeError('Entry limit');
          output += token(key) + token(item);
        }
        output += '}';
        break;
      case 5:
        output += 'e{';
        for (const item of Set.prototype.values.call(value)) {
          if (++entries > 1000000) throw new TypeError('Entry limit');
          output += token(item);
        }
        output += '}';
        break;
      case 6: {
        const source = Object.getOwnPropertyDescriptor(
          RegExp.prototype,
          'source',
        )!.get!.call(value);
        let flags = '';
        for (const [name, flag] of [
          ['hasIndices', 'd'],
          ['global', 'g'],
          ['ignoreCase', 'i'],
          ['multiline', 'm'],
          ['dotAll', 's'],
          ['unicode', 'u'],
          ['unicodeSets', 'v'],
          ['sticky', 'y'],
        ])
          if (
            Object.getOwnPropertyDescriptor(RegExp.prototype, name)?.get?.call(
              value,
            )
          )
            flags += flag;
        output +=
          'g' +
          str(source) +
          str(flags) +
          token(Object.getOwnPropertyDescriptor(value, 'lastIndex')!.value);
      }
    }
  }
  if (!trusted && checkBudget) checkTextLimit(output);
  return output;
}

/** Review-only factory with a direct WeakMap path when omit is absent. */
export function compactFactory(
  options: { cache?: 'none' | 'immutable'; prefix?: string } = {},
) {
  if (
    options.cache !== undefined &&
    options.cache !== 'none' &&
    options.cache !== 'immutable'
  )
    throw new TypeError('Invalid cache');
  const prefix = options.prefix ?? '';
  const objects = new WeakMap<object, number>();
  const symbols = new Map<symbol, number>();
  const cache =
    options.cache === 'immutable'
      ? new WeakMap<object, { plain?: string; omitted?: Map<string, string> }>()
      : undefined;
  let next = 0;
  const opaque = (value: object | symbol) => {
    const map = (typeof value === 'symbol' ? symbols : objects) as Map<
      object | symbol,
      number
    >;
    let id = map.get(value);
    if (id === undefined) {
      id = next++;
      map.set(value, id);
    }
    return id;
  };
  return (
    value: unknown,
    config?: { omit?: readonly string[] | ReadonlySet<string> },
  ) => {
    if (
      !cache ||
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function')
    )
      return compact(value, { ...config, prefix }, opaque);
    const omit = config?.omit;
    let record = cache.get(value);
    if (!omit) {
      if (record?.plain !== undefined) return record.plain;
      const text = compact(value, { prefix }, opaque);
      if (record) record.plain = text;
      else cache.set(value, { plain: text });
      return text;
    }
    const sorted = [...omit].sort();
    let signature = '';
    for (let i = 0; i < sorted.length; i++)
      if (i === 0 || sorted[i] !== sorted[i - 1])
        signature += sorted[i].length + ':' + sorted[i];
    const hit = record?.omitted?.get(signature);
    if (hit !== undefined) return hit;
    const text = compact(value, { omit, prefix }, opaque);
    if (!record) {
      record = {};
      cache.set(value, record);
    }
    (record.omitted ??= new Map()).set(signature, text);
    return text;
  };
}
