export const serializeSingleDepth = (object: any, omit?: string[]): string => {
  if (!object || typeof object !== 'object') return JSON.stringify(object);
  const entries = Object.entries(object).sort(([key1], [key2]) =>
    key1.localeCompare(key2),
  );
  const result = new Array(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (omit?.includes(key)) continue;
    result[i] =
      `${key}:${typeof value === 'object' ? JSON.stringify(value) : value}`;
  }
  return result.join('|');
};
