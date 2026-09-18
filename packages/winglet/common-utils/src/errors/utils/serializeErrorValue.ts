import type { Dictionary } from '@aileron/declare';

import { isSerializableError } from './isSerializableError';
import { unwrapBoxedPrimitive } from './unwrapBoxedPrimitive';

/**
 * Copies error metadata into JSON-compatible values without retaining cycles.
 * @param value - Metadata to normalize; accessor and hook exceptions propagate.
 * @param ancestors - Objects on the current path, including the enclosing error.
 * @param key - Property name passed to a custom JSON serialization hook.
 * @param applyToJSON - Whether this node has not yet consumed its JSON hook.
 * @returns A detached JSON value, or undefined for an omitted value or cycle.
 */
export const serializeErrorValue = (
  value: unknown,
  ancestors: readonly object[],
  key: string,
  applyToJSON = true,
): unknown => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value !== 'object' || ancestors.includes(value)) return undefined;

  const path = [...ancestors, value];
  let source = value as Record<string, unknown>;
  const isError = isSerializableError(value);
  if (isError) {
    source = {
      ...source,
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
    if ('cause' in value) source.cause = value.cause;
    if ('errors' in value) source.errors = value.errors;
  } else if (applyToJSON) {
    const toJSON = source.toJSON;
    if (typeof toJSON === 'function') {
      const result: unknown = toJSON.call(value, key);
      if (result !== value)
        return serializeErrorValue(result, path, key, false);
    }
  }

  if (!isError) {
    const primitive = unwrapBoxedPrimitive(value);
    if (primitive !== value)
      return serializeErrorValue(primitive, path, key, false);
  }

  if (Array.isArray(value)) {
    const result: unknown[] = new Array(value.length);
    for (let i = 0, l = value.length; i < l; i++)
      result[i] = serializeErrorValue(value[i], path, String(i)) ?? null;
    return result;
  }

  const result: Dictionary = {};
  for (const property of Object.keys(source)) {
    const serialized = serializeErrorValue(source[property], path, property);
    if (serialized !== undefined)
      Object.defineProperty(result, property, {
        value: serialized,
        enumerable: true,
        writable: true,
        configurable: true,
      });
  }
  return result;
};
