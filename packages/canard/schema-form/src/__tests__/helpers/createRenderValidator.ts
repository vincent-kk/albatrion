import Ajv from 'ajv/dist/2020';
import type { AnySchema } from 'ajv';

import type { ValidationIssue, ValidatorPlugin } from '@/schema-form';

/**
 * Register each copied root once so synchronous guards resolve root-local refs.
 * @returns An isolated validator with root registration, guards, and release.
 */
export const createRenderValidator = (): ValidatorPlugin => {
  const roots = new WeakMap<object, { ajv: Ajv; id: string }>();
  const registered = (root: Parameters<ValidatorPlugin['compile']>[0]) => {
    let entry = roots.get(root);
    if (!entry) {
      const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
      const id = typeof root.$id === 'string' ? root.$id : 'https://schema-form.test/root';
      ajv.addSchema(root as AnySchema, id);
      entry = { ajv, id };
      roots.set(root, entry);
    }
    return entry;
  };
  return {
    compile(root) {
      const { ajv, id } = registered(root);
      const validate = ajv.getSchema(id)!;
      return (value) => {
        if (validate(value)) return null;
        return (validate.errors ?? []).map((error): ValidationIssue => ({
          dataPath: error.keyword === 'required'
            ? `${error.instancePath}/${String(error.params.missingProperty).replace(/~/g, '~0').replace(/\//g, '~1')}`
            : error.instancePath,
          schemaPath: error.schemaPath,
          keyword: error.keyword,
          message: error.message,
          details: error.params,
          source: error,
        }));
      };
    },
    compileGuard(root, pointer) {
      const { ajv, id } = registered(root);
      const guard = ajv.getSchema(`${id}#${pointer}`);
      if (!guard) throw new Error(`No guard at ${pointer}`);
      return (value) => {
        const result: unknown = guard(value);
        if (typeof result !== 'boolean') throw new TypeError('Guard must be synchronous');
        return result;
      };
    },
    release: (root) => { roots.delete(root); },
  };
};
