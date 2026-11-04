import type { AnySchema } from 'ajv';
import Ajv from 'ajv/dist/2020';

import type { ValidatorPlugin } from '../../../../src';

/**
 * Register an authored root once so both validator channels resolve local refs.
 * @param root - Public authored schema whose identity owns the guard cache.
 * @param roots - Consumer-owned cache, released by the validator plugin.
 * @returns The registered synchronous AJV instance and its root identifier.
 */
export function registerValidatorRoot(root: Parameters<ValidatorPlugin['compile']>[0], roots: WeakMap<object, { ajv: Ajv; id: string }>) {
  let entry = roots.get(root);
  if (!entry) {
    const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
    const id = typeof root.$id === 'string' ? root.$id : 'https://schema-form.story/root';
    ajv.addSchema(root as AnySchema, id);
    entry = { ajv, id };
    roots.set(root, entry);
  }
  return entry;
}
