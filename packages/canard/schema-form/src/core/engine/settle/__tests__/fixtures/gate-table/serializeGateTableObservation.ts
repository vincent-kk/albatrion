/**
 * Encode a checkpoint without dropping scalar distinctions, error identity or key order.
 * @param observation - A completed settlement or the complete fixed history
 * @returns Deterministic JSON text; runtime stacks are intentionally excluded
 */
export const serializeGateTableObservation = (observation: unknown): string =>
  JSON.stringify(
    observation,
    (_key, value: unknown) => {
      if (value === undefined) return { $undefined: true };
      if (typeof value === 'number' && !Number.isFinite(value))
        return { $number: String(value) };
      if (Object.is(value, -0)) return { $number: '-0' };
      if (typeof value === 'function') return { $function: true };
      if (value instanceof Error)
        return {
          name: value.name,
          message: value.message,
          code: Reflect.get(value, 'code'),
          details: Reflect.get(value, 'details'),
        };
      if (value instanceof Map) return [...value];
      if (value instanceof Set) return [...value];
      return value;
    },
    2,
  );
