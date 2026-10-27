import type { Dictionary } from '@aileron/declare';

import type { InferValueType } from '@/schema-form/types';

import type { FormErrorReporter } from '../../../../errors';
import { blueprint } from '../../../engine';
import type { BlueprintOptions } from '../../../engine';
import type { AuthoredSchema } from '../../../engine';
import type { ValidationMode } from '../../../engine';
import type { Validator } from '../../../engine';
import type { FieldNode, InferFieldNode } from '../../type';
import { fieldNodeFactory } from '../fieldNodeFactory';

/** Construction inputs shared by the binding and the internal nodeFromJSONSchema helper. */
type BuildFieldNodeTreeProps<Schema extends AuthoredSchema = AuthoredSchema> = {
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
  cache?: BlueprintOptions['cache'];
};

/**
 * Binding-only; not exported from src/index.ts.
 * Build the shared core-host and React-binding tree without mounting it.
 * @param props - Authored schema, retained default source, predicates and services
 * @returns The inferred root with its load snapshot and no committed mount
 */
export function buildFieldNodeTree<Schema extends AuthoredSchema>(
  props: BuildFieldNodeTreeProps<Schema>,
): InferFieldNode<Schema>;
export function buildFieldNodeTree(props: BuildFieldNodeTreeProps): FieldNode {
  return fieldNodeFactory(
    blueprint(props.jsonSchema, props),
    {
      diagnostics: { status: 'stable' },
      loadSnapshot: props.defaultValue,
      context: props.context,
      validationMode: props.validationMode,
      onChange: props.onChange,
      onStateChange: props.onStateChange,
      errorReporter: props.errorReporter,
      unsetOnInactive: props.unsetOnInactive,
      disableAutomaticWrites: props.disableAutomaticWrites,
    },
    props.validator,
  );
}
