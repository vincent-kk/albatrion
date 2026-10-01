import type { SchemaRootRegistration } from './utils/registerSchemaRoot';

/** Compile a synchronous pointer reference in its registered root context. */
export const createGuardCompiler = (
  registration: SchemaRootRegistration,
  pointer: string,
): ((value: unknown) => boolean) => {
  const fragment = pointer.startsWith('#') ? pointer : `#${pointer}`;
  const guard = registration.guard;
  const guardCopy = registration.guardCopy;
  if (!guard || !guardCopy) throw new Error('Ajv 7 guard root was not registered');
  const validate = guard.compile({ $ref: `${registration.rootId}${fragment}` });
  const rootValidate = guard.getSchema(registration.rootId);
  if (!rootValidate) throw new Error(`Registered Ajv guard root was not found: ${registration.rootId}`);
  const dynamicAnchors: Record<string, typeof rootValidate> = {};
  if ('$dynamicAnchor' in guardCopy && typeof guardCopy.$dynamicAnchor === 'string')
    dynamicAnchors[guardCopy.$dynamicAnchor] = rootValidate;
  if ('$recursiveAnchor' in guardCopy && guardCopy.$recursiveAnchor === true)
    dynamicAnchors[''] = rootValidate;
  return (value) => {
    const result = validate(value, {
      dataPath: '', parentData: {}, parentDataProperty: '',
      rootData: value as Record<string, unknown>, dynamicAnchors: { ...dynamicAnchors },
    });
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 7 guard must return a synchronous boolean');
    return result;
  };
};
