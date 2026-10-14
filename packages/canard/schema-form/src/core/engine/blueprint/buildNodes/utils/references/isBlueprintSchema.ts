import type { BlueprintSchema } from '../../../types/schema';

/**
 * Narrow a raw schema envelope without validating its keywords.
 * @param value - Opaque authored value, including arrays and non-plain objects
 * @returns Whether the value is a boolean or non-null object schema envelope
 */
export const isBlueprintSchema = (value: unknown): value is BlueprintSchema =>
  typeof value === 'boolean' || (value !== null && typeof value === 'object');
