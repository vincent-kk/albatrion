import type Ajv from 'ajv';

import { cloneInstance } from '../cloneInstance';
import { pointerCompilers } from '../pointerCompilerCache';

/**
 * Select a cache whose generated paths never depend on application compilation order.
 * @param instance - Application instance or a plugin-owned normalized profile.
 * @returns A stable compiler preserving live rules with JSON Pointer object paths.
 */
export const pointerCompilerOf = (instance: Ajv.Ajv): Ajv.Ajv => {
  const previous = pointerCompilers.get(instance);
  if (previous) return previous;
  const compiler = cloneInstance(
    instance,
    !!instance._opts.allErrors,
    instance._opts.validateSchema,
    { jsonPointers: true, errorDataPath: 'object' },
  );
  pointerCompilers.set(instance, compiler);
  return compiler;
};
