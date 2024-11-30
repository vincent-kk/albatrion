export const stringifyObject = (object: any): string => {
  if (!object || typeof object !== 'object') return String(object);
  const entries = Object.entries(object).sort(([key1], [key2]) =>
    key1.localeCompare(key2),
  );
  const result = new Array(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    result[i] =
      `${key}:${typeof value === 'object' ? JSON.stringify(value) : value}`;
  }
  return result.join('|');
};

export const stringifyObjectWithFullSortedKeys = (object: any): string => {
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
      if (value && typeof value === 'object') {
        stack.push({ obj: value, prefix: fullKey });
      } else {
        parts.push(`${fullKey}:${String(value)}`);
      }
    }
  }
  return parts.join('|');
};
