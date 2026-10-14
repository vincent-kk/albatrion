import type Ajv from 'ajv';

import { ValidatorBindRefusedError } from './ValidatorBindRefusedError';

/**
 * Rejects a custom AJV instance whose built-in options can modify input data.
 * @param instance - Candidate AJV 8 instance; custom modifying keywords remain caller responsibility.
 * @returns Nothing when binding preserves input values.
 */
export const assertBindableInstance = (instance: Ajv): void => {
  const options = [
    instance.opts.coerceTypes && 'coerceTypes',
    instance.opts.useDefaults && 'useDefaults',
    instance.opts.removeAdditional && 'removeAdditional',
  ].filter((name): name is string => typeof name === 'string');
  if (options.length > 0) throw new ValidatorBindRefusedError(options);
};
