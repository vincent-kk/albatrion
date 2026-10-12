import Ajv from 'ajv';
import type { AnySchema } from 'ajv';
import type { BlueprintSchema } from '../../blueprint';
import type { GuardFunction, Validator } from '../../validation';

/** Behavior selected for the guard error cases shared by core tests. */
export type TestGuardMode = 'normal' | 'throw' | 'promise';

/**
 * Create an Ajv 8 implementation of the core validator contract for tests.
 * @param mode - Optional deliberate guard failure used by settlement cases.
 * @returns An independent validator instance with compile and compileGuard.
 */
export const createTestValidator = (mode: TestGuardMode = 'normal'): Validator => {
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  const guardRoots = new WeakMap<object, Ajv>();
  return {
    compile(copy: BlueprintSchema) {
      const validate = ajv.compile(copy as AnySchema);
      return (value: unknown) => {
        if (validate(value)) return null;
        return (validate.errors ?? []).map((error) => ({
          dataPath: error.instancePath, keyword: error.keyword,
          message: error.message, schemaPath: error.schemaPath,
          details: error.params, source: error,
        }));
      };
    },
    compileGuard(root: BlueprintSchema, pointer: string): GuardFunction {
      if (mode === 'throw') return () => {
        throw new Error('guard evaluation failed');
      };
      if (mode === 'promise')
        return () => Promise.resolve(true) as unknown as boolean;
      if (root === null || typeof root !== 'object')
        throw new TypeError('An authored guard requires a root object');
      let guardAjv = guardRoots.get(root);
      if (!guardAjv) {
        guardAjv = new Ajv({ strict: false, allErrors: true,
          validateSchema: false });
        guardAjv.addSchema(structuredClone(root) as AnySchema,
          'https://example.test/generated-guard-root');
        guardRoots.set(root, guardAjv);
      }
      const id = typeof root.$id === 'string'
        ? root.$id : 'https://example.test/generated-guard-root';
      const validate = guardAjv.getSchema(`${id}#${pointer}`);
      if (!validate) throw new Error(`No guard at ${pointer}`);
      return (value: unknown) => {
        const verdict: unknown = validate(value);
        if (typeof verdict !== 'boolean')
          throw new TypeError(`Asynchronous guard at ${pointer}`);
        return verdict;
      };
    },
  };
};
