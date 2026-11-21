import type { Ajv } from 'ajv';

import type { ApplicationEntry } from './types';

/**
 * Observe both native registries at one address, including absent aliases.
 * @param source - Application whose own registry keys are read without native lookup calls.
 * @param key - Normalized schema or alias key, including an absent key to observe.
 * @returns Exact own-key entries from both native registries, with undefined for absent entries.
 */
export const readApplicationEntry = (
  source: Ajv,
  key: string,
): ApplicationEntry => ({
  schema: Object.prototype.hasOwnProperty.call(source._schemas, key)
    ? source._schemas[key]
    : undefined,
  ref: Object.prototype.hasOwnProperty.call(source._refs, key)
    ? source._refs[key]
    : undefined,
});
