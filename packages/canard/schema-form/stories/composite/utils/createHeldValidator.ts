import type { ValidatorFactory } from '../../../src';
import { countedAjv8Plugin } from '../../features/components/countedAjv8Plugin';

/** Validator over the registered ajv8 plugin whose verdicts a play can hold, plus its controls. */
export interface HeldValidator {
  /** Factory to pass as the Form validatorFactory prop. */
  readonly factory: ValidatorFactory;
  /** Make every later verdict wait until release. */
  readonly hold: () => void;
  /** Deliver every held verdict and stop holding. */
  readonly release: () => void;
}

/**
 * Build a validator factory over the ajv8 plugin whose verdicts can be held until released.
 * @returns The factory and its hold controls; a boolean schema accepts everything or nothing.
 */
export const createHeldValidator = (): HeldValidator => {
  const base = countedAjv8Plugin.validator!;
  const pending: (() => void)[] = [];
  let held = false;
  return {
    factory: {
      compileGuard: (root, pointer) => (typeof root === 'boolean' ? () => root : base.compileGuard!(root, pointer)),
      compile: (schema) => {
        const validate = typeof schema === 'boolean' ? () => (schema ? null : [{ dataPath: '', keyword: 'false' }]) : base.compile(schema);
        return (value) => (held ? new Promise((resolve) => { pending.push(() => resolve(validate(value))); }) : validate(value));
      },
    },
    hold: () => { held = true; },
    release: () => { held = false; pending.splice(0).forEach((resume) => resume()); },
  };
};
