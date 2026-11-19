import Ajv from 'ajv';

import { pointerCompilers } from './pointerCompilerCache';

import { createMultipleOfCode } from './createDefaultInstance/createMultipleOfCode';

/**
 * Create the plugin's own AJV profile without changing application-supplied instances.
 * @param options - Default profile copied into this instance and its isolated siblings.
 * @returns A validator with native-shaped multipleOf errors and zero-divisor rejection.
 */
export const createDefaultInstance = (options: Ajv.Options): Ajv.Ajv => {
  const instance = new Ajv({ ...options, jsonPointers: true, errorDataPath: 'object' });
  pointerCompilers.set(instance, instance);
  instance.removeKeyword('multipleOf');
  instance.addKeyword('multipleOf', {
    type: 'number',
    statements: true,
    errors: 'full',
    inline: createMultipleOfCode,
  });
  return instance;
};
