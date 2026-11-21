import { equals } from '@winglet/common-utils/object';
import type { Ajv } from 'ajv';

import { readApplicationResource } from './readApplicationResource';
import type { ApplicationEntry, SchemaDependencies } from './types';

/**
 * Compare each authored resource with current application addresses without registering it.
 * @param source - Application whose normalized address registrations remain read-only.
 * @param resources - Authored root and embedded resource claims collected with the native resolver.
 * @returns Observed occupied and absent entries; throws the documented root or embedded collision error.
 */
export const checkRootCollisions = (
  source: Ajv,
  resources: SchemaDependencies['resources'],
): Map<string, ApplicationEntry> => {
  const observations = new Map<string, ApplicationEntry>();
  for (const resource of resources) {
    const existing = readApplicationResource(
      source,
      resource.address,
      observations,
    );
    if (!existing) continue;
    if (resource.root && !equals(existing.target, resource.schema))
      throw new Error(
        `schema with key or id "${resource.address}" already exists`,
      );
    if (!equals(existing.target, resource.schema))
      throw new Error(
        `reference "${resource.address}" resolves to more than one schema`,
      );
  }
  return observations;
};
