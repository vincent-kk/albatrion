import type { SchemaRootRegistration } from './registerSchemaRoot';

/** Remove Ajv's strong references when a root is released or collected. */
export const disposeSchemaRoot = (registration: SchemaRootRegistration): void => {
  for (const resource of [registration, ...registration.probes]) {
    if (resource.validationCopy) {
      resource.validationAjv.removeSchema(resource.key);
      resource.validationAjv.removeSchema(resource.validationCopy);
      for (const ref of resource.validationRefs) resource.validationAjv.removeSchema(ref);
    }
    if (resource.guardAjv) {
      resource.guardAjv.removeSchema(resource.key);
      if (resource.guardCopy) resource.guardAjv.removeSchema(resource.guardCopy);
      for (const ref of resource.guardRefs ?? []) resource.guardAjv.removeSchema(ref);
      for (const schema of resource.directGuards)
        if (typeof schema !== 'boolean') resource.guardAjv.removeSchema(schema);
      resource.directGuards.length = 0;
    }
  }
};
