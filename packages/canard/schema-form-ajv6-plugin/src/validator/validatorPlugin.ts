import type { ValidationIssue, ValidatorPlugin } from '@canard/schema-form';
import Ajv from 'ajv';

import { createGuardCompiler } from './createGuardCompiler';
import { createValidatorFactory } from './createValidatorFactory';
import { assertBindableInstance } from './utils/assertBindableInstance';
import {
  registerSchemaRoot,
  type SchemaRootRegistration,
} from './utils/registerSchemaRoot';
import { releaseSchemaRoot } from './utils/releaseSchemaRoot';

/**
 * AJV6 defaults preserve the plugin's Draft-07 and format behavior.
 */
const defaultSettings: Ajv.Options = {
  allErrors: true,
  nullable: true,
  verbose: true,
  format: false,
};

/** The consumer binding is process-wide, as required by ValidatorPlugin.bind. */
let ajvInstance: Ajv.Ajv | null = null;
/** Root registrations belong to the current binding. */
let roots = new WeakMap<object, SchemaRootRegistration>();
/** Live registrations expose overlapping IDs to the registration boundary. */
let active: SchemaRootRegistration[] = [];

/**
 * Ajv 6 validation and synchronous guards for schema-form.
 */
export const ajvValidatorPlugin: ValidatorPlugin &
  Required<Pick<ValidatorPlugin, 'compileGuard' | 'release'>> = {
  bind: (instance: Ajv.Ajv) => {
    assertBindableInstance(instance);
    ajvInstance = instance;
    roots = new WeakMap();
    active = [];
  },
  compile: (jsonSchema) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    const registered = registerSchemaRoot(jsonSchema, ajvInstance, roots, active);
    const validate = createValidatorFactory(registered.validation, registered.key)(jsonSchema);
    return async (value: unknown): Promise<ValidationIssue[] | null> => validate(value);
  },
  compileGuard: (root, pointer) => {
    if (!ajvInstance) ajvInstance = new Ajv(defaultSettings);
    const registered = registerSchemaRoot(root, ajvInstance, roots, active);
    return createGuardCompiler(registered, pointer);
  },
  release: (root) => releaseSchemaRoot(root, roots, active),
  dialect: 'http://json-schema.org/draft-07/schema#',
} satisfies ValidatorPlugin;
