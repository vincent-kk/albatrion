import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  if (registration.validationCopy) {
    registration.validation.removeSchema(registration.key);
    registration.validation.removeSchema(registration.validationCopy);
  }
  if (registration.guard) {
    registration.guard.removeSchema(registration.key);
    if (registration.guardCopy) registration.guard.removeSchema(registration.guardCopy);
  }
};
