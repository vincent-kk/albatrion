import type { AjvInstance as Ajv } from '../types/AjvInstance';

/**
 * Checks whether the application can introduce async evaluation outside the authored root.
 * @param instance - The live native application at the point the profile is captured.
 * @returns Whether a root without an explicit marker can keep native synchronous evaluation.
 */
export const canCompileUnmarkedRoot = (instance: Ajv): boolean =>
  !instance.opts.code?.process &&
  Object.values(instance.RULES.all).every((rule) =>
    typeof rule !== 'object' || !('async' in rule.definition) || !rule.definition.async,
  ) &&
  Object.values(instance.formats).every((format) =>
    !format || typeof format !== 'object' || !('async' in format) || !format.async,
  ) &&
  [...Object.values(instance.schemas), ...Object.values(instance.refs)].every((entry) =>
    !entry || typeof entry === 'string' ||
    (entry.meta === true && !JSON.stringify(entry.schema).includes('"$async"')),
  );
