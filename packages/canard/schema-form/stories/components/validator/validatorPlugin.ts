import type { ValidatorPlugin } from '../../../src';
import type Ajv from 'ajv/dist/2020';

import { createValidatorFactory } from './createValidatorFactory';
import { registerValidatorRoot } from './utils/registerValidatorRoot';

/** Authored root identity scopes synchronous guards and whole-form validation. */
const roots = new WeakMap<object, { ajv: Ajv; id: string }>();

/** New validator shape: compile, synchronous compileGuard, and cache release. */
export const ajvValidatorPlugin: ValidatorPlugin = {
  compile: (root) => createValidatorFactory(registerValidatorRoot(root, roots).ajv)(root),
  compileGuard: (root, pointer) => {
    const { ajv, id } = registerValidatorRoot(root, roots);
    const guard = ajv.getSchema(`${id}#${pointer}`);
    if (!guard) throw new Error(`Missing guard at ${pointer}`);
    return (value) => {
      const verdict: unknown = guard(value);
      if (typeof verdict !== 'boolean') throw new TypeError('Guard must be synchronous');
      return verdict;
    };
  },
  release: (root) => { roots.delete(root); },
};
