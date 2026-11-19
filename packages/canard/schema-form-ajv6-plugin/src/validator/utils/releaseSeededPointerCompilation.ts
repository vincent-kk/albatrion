import { pointerCompilations } from './pointerCompilerCache';

/**
 * Drop an owned native shell without serializing or deleting unrelated cache entries.
 * @param schema - Registered snapshot identifying the private pointer compilation.
 * @returns True when a seeded shell was removed; false leaves ordinary native cleanup to its caller.
 */
export const releaseSeededPointerCompilation = (schema: object): boolean => {
  const compiled = pointerCompilations.get(schema);
  const seeded = compiled?.seeded;
  if (!compiled || !seeded) return false;
  const { compiler } = compiled;
  if (compiler._schemas[seeded.key] === seeded.environment)
    delete compiler._schemas[seeded.key];
  if (compiler._refs[seeded.id] === seeded.environment)
    delete compiler._refs[seeded.id];
  if (compiler._cache.get(seeded.cacheKey) === seeded.environment)
    compiler._cache.del(seeded.cacheKey);
  pointerCompilations.delete(schema);
  return true;
};
