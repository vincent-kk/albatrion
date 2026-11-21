import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  const ownership = registration.validationOwnership;
  if (ownership) {
    const ajv = registration.validation;
    if (ajv._schemas[registration.key] === ownership.environment) {
      if (ownership.isCacheOwned) ajv.removeSchema(registration.key);
      else delete ajv._schemas[registration.key];
    }
    for (const [key, value] of ownership.refs)
      if (ajv._refs[key] === value) delete ajv._refs[key];
  }
  if (registration.guard) {
    registration.guard.removeSchema(registration.key);
    if (registration.guardCopy) registration.guard.removeSchema(registration.guardCopy);
    for (const schema of registration.directGuards)
      if (typeof schema !== 'boolean') registration.guard.removeSchema(schema);
    registration.directGuards.length = 0;
  }
};
