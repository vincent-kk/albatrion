// NODE-058, SURFACE-059, REACT-032, GOAL-088: checked by the package tsc command.
import { expectTypeOf } from 'vitest';

import type { SchemaPresentation } from '@/schema-form/types';

import type { AuthoredSchema, Validator } from '../../core';
import { FieldNodeEventType, ValidationMode, isUnionNode } from '../../index';
import type {
  FieldInputHint,
  FieldInputProps,
  FieldNode,
  InferFieldNode,
  JSONSchema,
  NumberNode,
  UnionNode,
  ValidatorFactory,
} from '../../index';

expectTypeOf<
  InferFieldNode<{ type: readonly ['string', 'number'] }>
>().toEqualTypeOf<UnionNode<readonly ['string', 'number'], false>>();
expectTypeOf<
  InferFieldNode<{ type: readonly ['string', 'number', 'null'] }>
>().toEqualTypeOf<UnionNode<readonly ['string', 'number'], true>>();
expectTypeOf<
  Extract<FieldNode, { type: 'union' }>
>().toEqualTypeOf<UnionNode>();

/** Verify that the public guard narrows a consumer's node union. */
function checkUnion(node: FieldNode) {
  if (isUnionNode(node)) expectTypeOf(node).toEqualTypeOf<UnionNode>();
}
void checkUnion;

expectTypeOf<FieldInputHint['type']>().toEqualTypeOf<FieldNode['type']>();
expectTypeOf<FieldInputHint['schemaType']>().toEqualTypeOf<
  FieldNode['schemaType']
>();
expectTypeOf<FieldInputHint['nullable']>().toEqualTypeOf<boolean>();
expectTypeOf<FieldInputHint['typeMismatch']>().toEqualTypeOf<boolean>();
expectTypeOf<FieldInputProps<number>['type']>().toEqualTypeOf<
  NumberNode['type']
>();
expectTypeOf<FieldInputProps<number>['schemaType']>().toEqualTypeOf<
  NumberNode['schemaType']
>();
expectTypeOf<
  FieldInputProps<number>['typeMismatch']
>().toEqualTypeOf<boolean>();
expectTypeOf<FieldInputProps<number>['nullable']>().toEqualTypeOf<boolean>();

const events: FieldNodeEventType[] = [
  FieldNodeEventType.UpdateValue,
  FieldNodeEventType.UpdateState,
  FieldNodeEventType.UpdateError,
  FieldNodeEventType.RequestFocus,
  FieldNodeEventType.RequestSelect,
  FieldNodeEventType.RequestRemount,
];
const modes: ValidationMode[] = [
  ValidationMode.None,
  ValidationMode.OnChange,
  ValidationMode.OnRequest,
];
void events;
void modes;

expectTypeOf<
  NonNullable<JSONSchema['presentation']>['inputType']
>().toEqualTypeOf<string | undefined>();

expectTypeOf<JSONSchema>().toEqualTypeOf<
  AuthoredSchema<object, SchemaPresentation>
>();
expectTypeOf<
  NonNullable<NonNullable<JSONSchema['properties']>[string]>['presentation']
>().toEqualTypeOf<SchemaPresentation | undefined>();
expectTypeOf<ValidatorFactory>().toEqualTypeOf<Validator>();

const invalidNumericConstraint: JSONSchema = {
  // @ts-expect-error Standard numeric constraints do not accept strings.
  maximum: 'invalid',
};
const invalidNestedPresentation: JSONSchema = {
  dependentSchemas: {
    field: {
      presentation: {
        // @ts-expect-error Recursive schema keywords retain the binding presentation shape.
        inputType: 123,
      },
    },
  },
};
const invalidStringPresentation: import('../../index').StringSchema = {
  type: 'string',
  presentation: {
    // @ts-expect-error Per-kind public aliases retain the same presentation shape.
    inputType: 123,
  },
};
void invalidNumericConstraint;
void invalidNestedPresentation;
void invalidStringPresentation;

// I12: the removed legacy error name must not return to the package entry.
// @ts-expect-error JSONSchemaError is preserved only for legacy implementation consumers.
type RemovedError = import('../../index').JSONSchemaError;
// 70C-01: host and binding channels stay outside the package's consumer surface.
// @ts-expect-error nodeFromJSONSchema is an internal surface helper.
type RemovedHostEntry = typeof import('../../index').nodeFromJSONSchema;
// @ts-expect-error nodeFromJSONSchema is not exported by core.
type RemovedCoreEntry = typeof import('../../core').nodeFromJSONSchema;
// @ts-expect-error buildFieldNodeTree is binding-only.
type RemovedBindingEntry = typeof import('../../index').buildFieldNodeTree;
expectTypeOf<RemovedError>().toBeAny();
expectTypeOf<RemovedHostEntry>().toBeAny();
expectTypeOf<RemovedCoreEntry>().toBeAny();
expectTypeOf<RemovedBindingEntry>().toBeAny();
