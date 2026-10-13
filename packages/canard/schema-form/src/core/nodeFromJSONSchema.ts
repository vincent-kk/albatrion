import type { Dictionary } from '@aileron/declare';

import type { FormErrorReporter } from '../errors';
import type { InferValueType } from '../types/value';
import { buildFieldNodeTree, mountFieldNode } from './FieldNode';
import type { InferFieldNode } from './FieldNode';
import type { BlueprintOptions } from './blueprint';
import type { JSONSchema } from './types/jsonSchema';
import type { ValidationMode } from './types/state';
import type { Validator } from './validation';

/**
 * Core-only host entry; <Form> calls the same build channel through binding-only functions.
 * @param props - Authored schema, initial value, services and host predicates;
 * invalid schemas fail during construction, before mounting.
 * @param props.isTerminal - Renderer predicate accepting raw object or boolean schemas;
 * undefined leaves earlier terminal hints intact.
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
  isTerminal?: BlueprintOptions['isTerminal'];
  isAtomic?: (value: unknown) => boolean;
  deferMountValidation?: boolean;
}): InferFieldNode<Schema> {
  const root = buildFieldNodeTree<Schema>(props);
  mountFieldNode(root, undefined, undefined, {
    deferValidation: props.deferMountValidation ?? false,
  });
  return root;
}
