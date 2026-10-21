/**
 * Encode a checkpoint without dropping scalar distinctions, error identity or key order.
 * @param observation - A completed settlement or the complete fixed history
 * @returns Deterministic JSON text; runtime stacks are intentionally excluded
 */
export const serializeGateTableObservation = (observation: unknown): string =>
  JSON.stringify(
    observation,
    function (this: Record<string, unknown>, key, value: unknown) {
      const original = this[key];
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
    2,
  );
