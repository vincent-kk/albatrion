import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  const ownership = registration.validationOwnership;
  if (ownership) {
    const ajv = registration.validationAjv;
    if (ajv.schemas[registration.key] === ownership.environment) {
      if (ownership.isCacheOwned) ajv.removeSchema(registration.key);
      else delete ajv.schemas[registration.key];
    }
    for (const [key, value] of ownership.refs)
      if (ajv.refs[key] === value) delete ajv.refs[key];
  }
  if (registration.guardAjv) {
    registration.guardAjv.removeSchema(registration.key);
    if (registration.guardCopy) registration.guardAjv.removeSchema(registration.guardCopy);
    for (const ref of registration.guardRefs ?? []) registration.guardAjv.removeSchema(ref);
    for (const schema of registration.directGuards)
      if (typeof schema !== 'boolean') registration.guardAjv.removeSchema(schema);
    registration.directGuards.length = 0;
  }
};
