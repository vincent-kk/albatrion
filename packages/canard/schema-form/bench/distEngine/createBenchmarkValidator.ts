import Ajv from 'ajv';
import type { AnySchema } from 'ajv';

import type { Validator } from '../../src/core/engine';

/** Supply the existing probe's normal Ajv service without executing test source. */
export function createBenchmarkValidator(): Validator {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    validateSchema: false,
  });
  const guardRoots = new WeakMap<object, Ajv>();
  return {
    compile(schema) {
      const validate = ajv.compile(schema as AnySchema);
      return (value) =>
        validate(value)
          ? null
          : (validate.errors ?? []).map((error) => ({
              dataPath: error.instancePath,
              keyword: error.keyword,
              message: error.message,
              schemaPath: error.schemaPath,
              details: error.params,
              source: error,
            }));
    },
    compileGuard(root, pointer) {
      if (root === null || typeof root !== 'object')
        throw new TypeError('An authored guard requires a root object');
      let guardAjv = guardRoots.get(root);
      if (!guardAjv) {
        guardAjv = new Ajv({
          strict: false,
          allErrors: true,
          validateSchema: false,
        });
        guardAjv.addSchema(
          structuredClone(root) as AnySchema,
          'https://example.test/generated-guard-root',
        );
        guardRoots.set(root, guardAjv);
      }
      const id =
        typeof root.$id === 'string'
          ? root.$id
          : 'https://example.test/generated-guard-root';
      const validate = guardAjv.getSchema(`${id}#${pointer}`);
      if (!validate) throw new Error(`No guard at ${pointer}`);
      return (value) => {
        const verdict: unknown = validate(value);
        if (typeof verdict !== 'boolean')
          throw new TypeError(`Asynchronous guard at ${pointer}`);
        return verdict;
      };
    },
  };
}
