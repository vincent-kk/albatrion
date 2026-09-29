/**
 * Find nested values a JSON round trip cannot preserve inside a whole value.
 * @param value - Opaque object or array retained by one terminal node
 * @param path - Absolute node path used to report nested locations
 * @returns Up to eight affected paths, without exposing their values
 */
export const collectNonJsonPaths = (value: unknown, path: string): string[] => {
  const found: string[] = [];
  const active = new WeakSet<object>();
  const pending: ({ value: unknown; path: string } | { leave: object })[] = [
    { value, path },
  ];
  while (pending.length && found.length < 8) {
    const frame = pending.pop();
    if (!frame) continue;
    if ('leave' in frame) {
      active.delete(frame.leave);
      continue;
    }
    const current = frame.value;
    const currentPath = frame.path;
    if (current === undefined || typeof current === 'function' ||
      typeof current === 'symbol' || typeof current === 'bigint' ||
      (typeof current === 'number' && !Number.isFinite(current))) {
      found.push(currentPath);
      continue;
    }
    if (current === null || typeof current !== 'object') continue;
    if (current instanceof Date || active.has(current)) {
      found.push(currentPath);
      continue;
    }
    active.add(current);
    pending.push({ leave: current });
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index--)
        pending.push({ value: current[index], path: `${currentPath}/${index}` });
    } else {
      const keys = Object.keys(current);
      for (let index = keys.length - 1; index >= 0; index--) {
        const key = keys[index];
        pending.push({ value: Reflect.get(current, key),
          path: `${currentPath}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}` });
      }
    }
  }
  return found;
};
