import type { AjvInstance as Ajv } from './types/AjvInstance';

import type { Dictionary } from '@aileron/declare';

import { GuardPointerNotSchemaError } from './utils/GuardPointerNotSchemaError';
import { cloneInstance } from './utils/cloneInstance';
import { collectGuardDynamicAnchors } from './utils/dynamicScope/collectGuardDynamicAnchors';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';
import { registerSchemaGuard } from './utils/registerSchemaGuard';
import type { SchemaRootRegistration } from './utils/registerSchemaRoot';
import { resolveGuardSchema } from './utils/resolveGuardSchema';

/**
 * Compile a synchronous guard directly when context-free, otherwise in its root.
 * A direct guard registers no root; only a root-pointer guard registers the root copy on the
 * guard instance, which compiles without meta-schema validation.
 * @param instance - The bound instance whose profile the guard instance copies.
 * @param registration - The first-error guard instance and owner of compiled guards.
 * @param pointer - The guard's original JSON Pointer, optionally prefixed with #.
 * @param root - The engine copy containing the original subschema object.
 * @param directGuardCompile - Enable direct compilation of self-contained guards.
 * @param finalizer - Cleanup owner for roots whose resources cannot retain the root.
 * @returns An input-preserving predicate; asynchronous results are refused.
 * @throws GuardPointerNotSchemaError when the pointer does not locate a schema
 * @throws Error when the guard or a declaration selected as its dynamic anchor is asynchronous, or when the guard
 * references a dynamic anchor inline that no chain resource and no ancestor of the reference inside the guard declares
 */
export const createGuardCompiler = (
  instance: Ajv,
  registration: SchemaRootRegistration,
  pointer: string,
  root: object,
  directGuardCompile: boolean,
  finalizer: FinalizationRegistry<SchemaRootRegistration>,
): ((value: unknown) => boolean) => {
  const fragment = pointer.startsWith('#') ? pointer : `#${pointer}`;
  const rootId = '$id' in root && typeof root.$id === 'string' ? root.$id : '';
  const located = resolveGuardSchema(root, pointer);
  if (located === undefined)
    throw new GuardPointerNotSchemaError(rootId, pointer);
  const schema = directGuardCompile ? located : undefined;
  const direct =
    schema !== undefined &&
    !Object.prototype.hasOwnProperty.call(root, '$schema') &&
    isSelfContainedGuard(schema, registration.guardChecks);
  if (direct) {
    // A direct root would retain itself through the finalizer's held value.
    // Its ID-free, dedicated guard is collected with the weak root registration.
    if (schema === root) finalizer.unregister(registration);
    if (!registration.directGuards.includes(schema))
      registration.directGuards.push(schema);
  }
  const guard = direct
    ? (registration.guard ??= cloneInstance(instance, false, false))
    : registerSchemaGuard(root, instance, registration);
  // Anchor locations compile before the guard so AJV generates the table lookup for its dynamic references.
  // A draft-07 instance leaves dynamic keywords unknown and ignored, so only a dynamic-vocabulary instance collects.
  const dynamicAnchors = direct || !guard.opts.dynamicRef || !registration.hasDynamicKeywords
    ? {}
    : collectGuardDynamicAnchors(root, registration.rootId, fragment, guard);
  const validate = guard.compile(
    direct ? schema : { $ref: `${registration.rootId}${fragment}` },
  );
  if (direct && '$async' in validate && validate.$async === true)
    throw new Error('async schema in sync schema');
  return (value) => {
    const result = validate(value, {
      dataPath: '',
      parentData: {},
      parentDataProperty: '',
      rootData: value as Dictionary<unknown>,
      dynamicAnchors: { ...dynamicAnchors },
    });
    if (typeof result !== 'boolean')
      throw new TypeError('Ajv 7 guard must return a synchronous boolean');
    return result;
  };
};
