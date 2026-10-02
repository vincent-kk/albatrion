import type { Dictionary } from '@aileron/declare';

import type { FormErrorReporter } from '../errors';
import type { InferValueType } from '../types/value';
import { buildSchemaNodeTree, mountSchemaNode } from './SchemaNode';
import type { InferSchemaNode } from './SchemaNode';
import type { JSONSchema } from './types/jsonSchema';
import type { ValidationMode } from './types/state';
import type { Validator } from './validation';

/**
 * Core-only host entry; <Form> calls the same build channel through binding-only functions.
 * @param props - Authored schema, initial value, services and host predicates;
 * invalid schemas fail during construction, before mounting.
 * @returns The mounted root; mount validation is requested unless explicitly deferred.
 */
export function nodeFromJSONSchema<Schema extends JSONSchema>(props: {
  jsonSchema: Schema;
  defaultValue?: InferValueType<Schema>;
  validator?: Validator;
  validationMode?: ValidationMode;
  context?: Dictionary;
  onChange?: (value: InferValueType<Schema> | undefined) => void;
  onStateChange?: () => void;
  errorReporter?: FormErrorReporter;
  unsetOnInactive?: boolean;
  disableAutomaticWrites?: boolean;
  isTerminal?: (schema: JSONSchema) => boolean | undefined;
  isAtomic?: (value: unknown) => boolean;
  deferMountValidation?: boolean;
}): InferSchemaNode<Schema> {
  // Blueprint invokes this predicate only for object/array declarations.
  const root = buildSchemaNodeTree<Schema>(
    props as Parameters<typeof buildSchemaNodeTree<Schema>>[0],
  );
  mountSchemaNode(root, undefined, undefined, {
    deferValidation: props.deferMountValidation ?? false,
  });
  return root;
}
