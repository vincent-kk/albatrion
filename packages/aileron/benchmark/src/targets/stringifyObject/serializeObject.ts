export const serializeObject = (object: any, omitKeys?: string[]): string => {
  if (!object || typeof object !== 'object') return JSON.stringify(object);
  const omit = omitKeys ? new Set(omitKeys) : null;
  const keys = Object.keys(object)
    .filter((key) => !omit?.has(key))
    .sort();
  const segments = new Array(keys.length);
  let key = keys.pop();
  let index = 0;
  while (key) {
    segments[index++] =
      `${key}:${typeof object[key] === 'object' ? JSON.stringify(object[key]) : object[key]}`;
    key = keys.pop();
  }
  return segments.join('|');
};
