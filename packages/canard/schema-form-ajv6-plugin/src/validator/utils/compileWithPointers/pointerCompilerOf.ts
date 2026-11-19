import type Ajv from 'ajv';

import { cloneInstance } from '../cloneInstance';
import { pointerCompilers } from '../pointerCompilerCache';

/**
 * Select a cache whose generated paths never depend on application compilation order.
 * @param instance - Application instance or a plugin-owned normalized profile.
 * @returns A stable data compiler preserving live rules; the source validates root meta-schemas.
 */
export const pointerCompilerOf = (instance: Ajv.Ajv): Ajv.Ajv => {
  const previous = pointerCompilers.get(instance);
  if (previous) return previous;
  const compiler = cloneInstance(
    instance,
    !!instance._opts.allErrors,
    false,
    { jsonPointers: true, errorDataPath: 'object', meta: false },
  );
  pointerCompilers.set(instance, compiler);
  return compiler;
};
