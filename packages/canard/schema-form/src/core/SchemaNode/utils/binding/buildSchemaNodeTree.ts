import type { Dictionary } from '@aileron/declare';
import type { JSONSchema } from '../../../types/jsonSchema';
import type { InferValueType } from '../../../../types/value';
import type { FormErrorReporter } from '../../../../errors';
import { blueprint } from '../../../blueprint';
import type { BlueprintOptions } from '../../../blueprint';
import type { Validator } from '../../../validation';
import type { ValidationMode } from '../../../types/state';
import type { InferSchemaNode, SchemaNode } from '../../type';
import { schemaNodeFactory } from '../schemaNodeFactory';

/** Construction inputs shared by the binding and the core host entry. */
type BuildSchemaNodeTreeProps<Schema extends JSONSchema = JSONSchema> = {
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
  isAtomic?: BlueprintOptions['isAtomic'];
};

/**
 * Binding-only; not exported from src/index.ts.
 * Build the shared core-host and React-binding tree without mounting it.
 * @param props - Authored schema, retained default source, predicates and services
 * @returns The inferred root with its load snapshot and no committed mount
 */
export function buildSchemaNodeTree<Schema extends JSONSchema>(
  props: BuildSchemaNodeTreeProps<Schema>,
): InferSchemaNode<Schema>;
export function buildSchemaNodeTree(props: BuildSchemaNodeTreeProps): SchemaNode {
  return schemaNodeFactory(blueprint(props.jsonSchema, props), {
    diagnostics: { status: 'stable' },
    loadSnapshot: props.defaultValue,
    context: props.context,
    validationMode: props.validationMode,
    onChange: props.onChange,
    onStateChange: props.onStateChange,
    errorReporter: props.errorReporter,
    unsetOnInactive: props.unsetOnInactive,
    disableAutomaticWrites: props.disableAutomaticWrites,
  }, props.validator);
}
