export const weakMapCacheFactory = <
  W extends WeakMap<object, any> = WeakMap<object, any>,
>(
  defaultValue?: W,
) => {
  const cache = defaultValue ?? (new WeakMap() as W);
  return {
    get raw() {
      return cache;
    },
    has: <T extends object>(key: T) => cache.has(key),
    get: <T extends object>(key: T) => cache.get(key),
    set: <T extends object>(key: T, value: Parameters<W['set']>[1]) =>
      cache.set(key, value),
    delete: <T extends object>(key: T) => cache.delete(key),
  };
};

export const mapCacheFactory = <M extends Map<string, any>>(
  defaultValue?: M | ReturnType<M['entries']>,
) => {
  const cache =
    defaultValue instanceof Map ? defaultValue : new Map(defaultValue || []);
  return {
    get raw() {
      return cache;
    },
    set: (key: Parameters<M['set']>[0], value: Parameters<M['set']>[1]) =>
      cache.set(key, value),
    has: (key: Parameters<M['has']>[0]) => cache.has(key),
    get: (key: Parameters<M['get']>[0]) => cache.get(key),
    delete: (key: Parameters<M['delete']>[0]) => cache.delete(key),
    size: () => cache.size,
    keys: () => cache.keys(),
    values: () => cache.values(),
    entries: () => cache.entries(),
    clear: () => cache.clear(),
  };
};
