import type { ModelApplication } from './types';

/** Read native registries and program counts without invoking application methods. */
export const captureApplicationState = (instance: ModelApplication) => {
  const records: Record<string, unknown> = { errors: instance.errors };
  for (const key of ['schemas', '_schemas', 'refs', '_refs', '_fragments']) {
    const registry = Reflect.get(instance, key);
    if (!registry || typeof registry !== 'object') continue;
    records[key] = Object.entries(registry).map(([address, entry]) => {
      if (typeof entry === 'string') return [address, entry];
      if (entry && (typeof entry === 'object' || typeof entry === 'function'))
        return [
          address,
          JSON.stringify(Reflect.get(entry, 'schema')),
          !!Reflect.get(entry, 'validate'),
          !!Reflect.get(entry, 'meta'),
          Object.keys(Reflect.get(entry, 'refs') ?? {}),
          Reflect.get(entry, 'refVal')?.length,
        ];
      return [address, entry];
    });
  }
  const cache = Reflect.get(instance, '_cache');
  const entries =
    cache instanceof Map
      ? [...cache.entries()]
      : Object.entries(cache?._cache ?? {});
  records.cache = entries.map(([key, entry]) => [
    typeof key === 'object' ? JSON.stringify(key) : key,
    JSON.stringify(entry?.schema),
    !!entry?.validate,
  ]);
  const scope = Reflect.get(instance, 'scope');
  records.scope = Object.entries(scope?._values ?? {}).map(([key, value]) => [
    key,
    value instanceof Map ? value.size : 0,
  ]);
  return records;
};
