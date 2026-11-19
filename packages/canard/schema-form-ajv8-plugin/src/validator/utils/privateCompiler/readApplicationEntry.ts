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
  schema: Object.prototype.hasOwnProperty.call(source.schemas, key)
    ? source.schemas[key]
    : undefined,
  ref: Object.prototype.hasOwnProperty.call(source.refs, key)
    ? source.refs[key]
    : undefined,
});
