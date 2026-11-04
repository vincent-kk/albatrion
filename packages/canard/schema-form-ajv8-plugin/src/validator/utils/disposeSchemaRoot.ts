import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  if (registration.validationRegistered && registration.validationCopy) {
    registration.validationAjv.removeSchema(registration.key);
    registration.validationAjv.removeSchema(registration.validationCopy);
    for (const ref of registration.validationRefs) registration.validationAjv.removeSchema(ref);
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
