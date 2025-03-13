export const weakMapCacheFactory = <V, K extends object = object>(
  defaultValue?: WeakMap<K, V>,
) => {
  const cache = defaultValue ?? (new WeakMap() as WeakMap<K, V>);
  return {
    get raw() {
      return cache;
    },
    has: (key: K) => cache.has(key),
    get: (key: K) => cache.get(key),
    set: (key: K, value: V) => cache.set(key, value),
    delete: (key: K) => cache.delete(key),
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
