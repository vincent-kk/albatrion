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
        stack.push({ obj: value, prefix: fullKey });
      else parts.push(`${fullKey}:${String(value)}`);
    }
  }
  return parts.join('|');
};
