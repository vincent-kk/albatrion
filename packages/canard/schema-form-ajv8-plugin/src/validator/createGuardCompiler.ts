import type { JSONSchema } from '@canard/schema-form';
import type { Ajv } from 'ajv';
import type { ValidateFunction } from 'ajv';

import type { Dictionary, Fn } from '@aileron/declare';

import { GuardPointerNotSchemaError } from './utils/GuardPointerNotSchemaError';
import { collectGuardDynamicAnchors } from './utils/dynamicScope/collectGuardDynamicAnchors';
import { isSelfContainedGuard } from './utils/isSelfContainedGuard';
import { makeSibling } from './utils/makeSibling';
import { registerSchemaGuard } from './utils/registerSchemaGuard';
import {
  type SchemaRootRegistry,
  registerSchemaRoot,
} from './utils/registerSchemaRoot';
import { resolveGuardSchema } from './utils/resolveGuardSchema';

/**
 * Compiles a synchronous guard at a location in its registered root.
 * @param ajv - The active AJV instance supplying the guard's dialect and extensions.
 * @param registry - Root registrations shared with full validation.
 * @param root - The authored root that contains the guard.
 * @param pointer - An unfragmented JSON Pointer to the guard schema.
 * @param directGuardCompile - Compile self-contained guards directly when enabled.
 * @returns A boolean predicate evaluated without changing its input.
 * @throws GuardPointerNotSchemaError when the pointer does not locate a schema
 * @throws Error when the guard or a declaration selected as its dynamic anchor is asynchronous, or when the guard
 * references a dynamic anchor inline that no chain resource and no ancestor of the reference inside the guard declares
 */
export const createGuardCompiler = (
  ajv: Ajv,
  registry: SchemaRootRegistry,
  root: JSONSchema,
  pointer: string,
  directGuardCompile: boolean,
): Fn<[value: unknown], boolean> => {
  const registration = registerSchemaRoot(registry, ajv, root);
  const rootId = typeof root.$id === 'string' ? root.$id : '';
  const located = resolveGuardSchema(root, pointer);
  if (located === undefined)
    throw new GuardPointerNotSchemaError(rootId, pointer);
  const schema = directGuardCompile ? located : undefined;
  if (
    schema !== undefined &&
    !Object.prototype.hasOwnProperty.call(root, '$schema') &&
    isSelfContainedGuard(schema, registration.guardChecks)
  ) {
    // A direct root would retain itself through the finalizer's held value.
    // Its ID-free, dedicated guard is collected with the weak root registration.
    if (schema === root) registry.finalizer.unregister(registration);
    if (!registration.directGuards.includes(schema))
      registration.directGuards.push(schema);
    registration.guardAjv ??= makeSibling(ajv, false, false);
    const validate = registration.guardAjv.compile(schema);
    if ('$async' in validate && validate.$async === true)
      throw new Error('async schema in sync schema');
    return (value) => !!validate(value);
  }
  const guard = registerSchemaGuard(ajv, root, registration);
  // Anchor locations compile before the guard so AJV generates the table lookup for its dynamic references.
  // A draft-07 instance leaves dynamic keywords unknown and ignored, so only a dynamic-vocabulary instance collects.
  const dynamicAnchors: Dictionary<ValidateFunction> =
    guard.opts.dynamicRef && registration.hasDynamicKeywords
      ? collectGuardDynamicAnchors(root, registration.key, pointer, guard)
      : {};
  const validate = guard.compile({ $ref: `${registration.key}#${pointer}` });
  if (Object.keys(dynamicAnchors).length === 0)
    return (value) => !!validate(value);
  return (value) =>
    !!validate(value, {
      instancePath: '',
      parentData: {},
      parentDataProperty: '',
      rootData: value as Dictionary<unknown>,
      dynamicAnchors: { ...dynamicAnchors },
    });
};
