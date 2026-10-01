import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { registerSchemaRoot, registerSchemaGuard, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { createSchemaRootRegistry } from './utils/releaseSchemaRoot';

/**
 * Compiles a synchronous guard at a location in its registered root.
 * @param ajv - The active AJV instance supplying the guard's dialect and extensions.
 * @param registry - Root registrations shared with full validation.
 * @param root - The authored root that contains the guard.
 * @param pointer - An unfragmented JSON Pointer to the guard schema.
 * @returns A boolean predicate evaluated without changing its input.
 */
export const createGuardCompiler = (
  ajv: Ajv,
  registry: SchemaRootRegistry,
  root: JSONSchema,
  pointer: string,
): ((value: unknown) => boolean) => {
  const registration = registerSchemaRoot(registry, ajv, root);
  const guard = registerSchemaGuard(ajv, root, registration);
  if (pointer === '/if' && ('$dynamicAnchor' in root || '$recursiveAnchor' in root)) {
    const probe = { ...structuredClone(root), then: false, else: true } as JSONSchema;
    const probeRegistry = createSchemaRootRegistry();
    probeRegistry.active.push(new WeakRef(registration));
    const probeRegistration = registerSchemaRoot(probeRegistry, ajv, probe);
    registration.probes.push(probeRegistration);
    const probeGuard = registerSchemaGuard(ajv, probe, probeRegistration);
    const validateProbe = probeGuard.compile({ $ref: probeRegistration.key });
    return (value) => !validateProbe(value);
  }
  const validate = guard.compile({ $ref: `${registration.key}#${pointer}` });
  return (value) => Boolean(validate(value));
};
