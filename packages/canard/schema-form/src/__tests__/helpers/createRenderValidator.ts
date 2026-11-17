import type { AnySchema } from 'ajv';
import AjvDraft7 from 'ajv';
import Ajv from 'ajv/dist/2020';

import type { ValidatorPlugin } from '@/schema-form/app/plugin';
import type { ValidationIssue } from '@/schema-form/core';

/**
 * Register each copied root once so synchronous guards resolve root-local refs.
 * @param dialect - Tuple vocabulary used by the authored verification scene.
 * @returns An isolated validator with root registration, guards, and release; an
 *   `additionalProperties` issue names its extra key in `rejectedKey`, as the ajv8 plugin does.
 */
export const createRenderValidator = (
  dialect: '2020' | 'draft7' = '2020',
): ValidatorPlugin => {
  const roots = new WeakMap<object, { ajv: Ajv | AjvDraft7; id: string }>();
  const registered = (root: Parameters<ValidatorPlugin['compile']>[0]) => {
    let entry = roots.get(root);
    if (!entry) {
      const Constructor = dialect === 'draft7' ? AjvDraft7 : Ajv;
      const ajv = new Constructor({
        allErrors: true,
        strict: false,
        validateFormats: false,
      });
      const id =
        typeof root.$id === 'string'
          ? root.$id
          : 'https://schema-form.test/root';
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
        return (validate.errors ?? []).map(
          (error): ValidationIssue => ({
            dataPath:
              error.keyword === 'required'
                ? `${error.instancePath}/${String(error.params.missingProperty).replace(/~/g, '~0').replace(/\//g, '~1')}`
                : error.instancePath,
            schemaPath: error.schemaPath,
            keyword: error.keyword,
            message: error.message,
            details: error.params,
            source: error,
            ...(error.keyword === 'additionalProperties'
              ? { rejectedKey: String(error.params.additionalProperty) }
              : {}),
          }),
        );
      };
    },
    compileGuard(root, pointer) {
      const { ajv, id } = registered(root);
      const guard = ajv.getSchema(`${id}#${pointer}`);
      if (!guard) throw new Error(`No guard at ${pointer}`);
      return (value) => {
        const result: unknown = guard(value);
        if (typeof result !== 'boolean')
          throw new TypeError('Guard must be synchronous');
        return result;
      };
    },
    release: (root) => {
      roots.delete(root);
    },
  };
};
