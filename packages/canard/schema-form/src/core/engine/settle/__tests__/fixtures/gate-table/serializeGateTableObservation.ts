import { createHash } from 'node:crypto';

/**
 * Encode a checkpoint without dropping scalar distinctions, error identity or key order.
 * @param observation - A completed settlement or the complete fixed history
 * @param compactSchemas - Hash only schema serialization; selections, deliveries,
 * shape dirty and verification evidence remain unchanged. Large bulk fixtures only.
 * @returns Deterministic JSON text; runtime stacks are intentionally excluded
 */
export const serializeGateTableObservation = (observation: unknown, compactSchemas = false): string => {
  const schemas = new WeakMap<object, string>();
  return JSON.stringify(
    observation,
    function (this: Record<string, unknown>, key, value: unknown) {
      const original = this[key];
      if (compactSchemas && key === 'schema' && original && typeof original === 'object' && !('$schemaHash' in original)) {
        let hash = schemas.get(original);
        if (!hash) {
          hash = createHash('sha256').update(serializeGateTableObservation(original)).digest('hex');
          schemas.set(original, hash);
        }
        return { $schemaHash: hash };
      }
      if (original instanceof Error)
        return {
          name: original.name,
          message: original.message,
          code: Reflect.get(original, 'code'),
          details: Reflect.get(original, 'details'),
        };
      if (value === undefined) return { $undefined: true };
      if (typeof value === 'number' && !Number.isFinite(value))
        return { $number: String(value) };
      if (Object.is(value, -0)) return { $number: '-0' };
      if (typeof value === 'function') return { $function: true };
      if (value instanceof Map) return [...value];
      if (value instanceof Set) return [...value];
      return value;
    },
    compactSchemas ? undefined : 2,
  );
};
