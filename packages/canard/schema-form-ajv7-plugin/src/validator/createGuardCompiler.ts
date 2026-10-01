import type { SchemaRootRegistration } from './utils/registerSchemaRoot';

/** Compile a synchronous pointer reference in its registered root context. */
export const createGuardCompiler = (
  registration: SchemaRootRegistration,
  pointer: string,
): ((value: unknown) => boolean) => {
  const fragment = pointer.startsWith('#') ? pointer : `#${pointer}`;
  const rootId = '$id' in registration.root && typeof registration.root.$id === 'string'
    ? registration.root.$id : registration.key;
  const validate = registration.guard.compile({ $ref: `${rootId}${fragment}` });
  const rootValidate = registration.guard.getSchema(rootId);
  if (!rootValidate) throw new Error(`Registered Ajv guard root was not found: ${rootId}`);
  const dynamicAnchors: Record<string, typeof rootValidate> = {};
  if ('$dynamicAnchor' in registration.root && typeof registration.root.$dynamicAnchor === 'string')
    dynamicAnchors[registration.root.$dynamicAnchor] = rootValidate;
  if ('$recursiveAnchor' in registration.root && registration.root.$recursiveAnchor === true)
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
