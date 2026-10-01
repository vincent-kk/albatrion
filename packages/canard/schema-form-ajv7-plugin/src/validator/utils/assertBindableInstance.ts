import type Ajv from 'ajv';

import { ValidatorBindRefusedError } from './ValidatorBindRefusedError';

/** Reject Ajv 7 options that can modify an emitted value. */
export const assertBindableInstance = (instance: Ajv): void => {
  const options = instance.opts;
  const enabled: string[] = [];
  if (options.coerceTypes) enabled.push('coerceTypes');
  if (options.useDefaults) enabled.push('useDefaults');
  if (options.removeAdditional) enabled.push('removeAdditional');
  if (enabled.length) throw new ValidatorBindRefusedError(enabled);
};
