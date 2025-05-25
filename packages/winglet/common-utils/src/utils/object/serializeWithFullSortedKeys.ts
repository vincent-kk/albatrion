/**
 * Serializes an object using fully expanded paths and sorted keys.
 * Flattens all paths of nested objects and sorts them into a string.
 *
 * @param object - Object to serialize
 * @returns Serialized string (in 'fullpath:value' format separated by '|')
 *
 * @example
 * serializeWithFullSortedKeys({a: 1, b: {c: 2}}); // 'a:1|b.c:2'
 * serializeWithFullSortedKeys({c: 3, a: 1, b: 2}); // 'a:1|b:2|c:3'
 */
export const serializeWithFullSortedKeys = (object: any): string => {
  if (!object || typeof object !== 'object') return String(object);
  const stack: Array<{ obj: any; prefix: string }> = [
    { obj: object, prefix: '' },
  ];
  const parts: string[] = [];
  while (stack.length > 0) {
    const { obj, prefix } = stack.pop()!;
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object')
        stack[stack.length] = { obj: value, prefix: fullKey };
      else parts[parts.length] = `${fullKey}:${String(value)}`;
    }
  }
  return parts.join('|');
};
