import type { TypeMismatchRecord } from '../../../record';

/**
 * Classify a raw value for structured mismatch diagnostics.
 * @param value - Original input after static interpretation
 * @returns Stable JSON kind name or the exceptional numeric/other case
 */
export const receivedType = (value: unknown): TypeMismatchRecord['received'] => {
  if (value === null) return 'null';
  if (typeof value === 'number')
    return !Number.isFinite(value) ? 'nonFinite' :
      Number.isInteger(value) ? 'integer' : 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'other';
};
