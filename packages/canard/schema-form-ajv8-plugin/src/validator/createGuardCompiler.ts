import type { JSONSchema } from '@canard/schema-form';
import type Ajv from 'ajv';

import { registerSchemaRoot, type SchemaRootRegistry } from './utils/registerSchemaRoot';
import { registerSchemaGuard } from './utils/registerSchemaGuard';
import { createSchemaRootRegistry } from './utils/createSchemaRootRegistry';
import { resolveGuardSchema } from './utils/resolveGuardSchema';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';

/**
 * Compiles a synchronous guard at a location in its registered root.
 * @param ajv - The active AJV instance supplying the guard's dialect and extensions.
 * @param registry - Root registrations shared with full validation.
 * @param root - The authored root that contains the guard.
 * @param pointer - An unfragmented JSON Pointer to the guard schema.
 * @param directGuardCompile - Compile self-contained guards directly when enabled.
 * @returns A boolean predicate evaluated without changing its input.
 */
export const createGuardCompiler = (
  ajv: Ajv,
  registry: SchemaRootRegistry,
  root: JSONSchema,
  pointer: string,
  directGuardCompile: boolean,
): ((value: unknown) => boolean) => {
  const registration = registerSchemaRoot(registry, ajv, root);
  const guard = registerSchemaGuard(ajv, root, registration);
  const schema = directGuardCompile ? resolveGuardSchema(root, pointer) : undefined;
  if (schema !== undefined && !Object.prototype.hasOwnProperty.call(root, '$schema') && isSelfContainedGuard(schema, registration.guardChecks)) {
    // A direct root would retain itself through the finalizer's held value.
    // Its ID-free, dedicated guard is collected with the weak root registration.
    if (schema === root) registry.finalizer.unregister(registration);
    if (!registration.directGuards.includes(schema)) registration.directGuards.push(schema);
    const validate = guard.compile(schema);
    if ('$async' in validate && validate.$async === true)
      throw new Error('async schema in sync schema');
    return (value) => Boolean(validate(value));
  }
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
