// NODE-058, SURFACE-059, REACT-032, GOAL-088: checked by the package tsc command.
import { expectTypeOf } from 'vitest';

import type { JSONSchema as CoreJSONSchema, Validator } from '../core';
import { SchemaNodeEventType, ValidationMode, isUnionNode } from '../index';
import type {
  FormTypeInputProps,
  Hint,
  InferSchemaNode,
  JSONSchema,
  NumberNode,
  SchemaNode,
  UnionNode,
  ValidatorFactory,
} from '../index';
import type { SchemaPresentation } from '../types/jsonSchema';

expectTypeOf<
  InferSchemaNode<{ type: readonly ['string', 'number'] }>
>().toEqualTypeOf<UnionNode<readonly ['string', 'number'], false>>();
expectTypeOf<
  InferSchemaNode<{ type: readonly ['string', 'number', 'null'] }>
>().toEqualTypeOf<UnionNode<readonly ['string', 'number'], true>>();
expectTypeOf<
  Extract<SchemaNode, { type: 'union' }>
>().toEqualTypeOf<UnionNode>();

/** Verify that the public guard narrows a consumer's node union. */
function checkUnion(node: SchemaNode) {
  if (isUnionNode(node)) expectTypeOf(node).toEqualTypeOf<UnionNode>();
}
void checkUnion;

expectTypeOf<Hint['type']>().toEqualTypeOf<SchemaNode['type']>();
expectTypeOf<Hint['schemaType']>().toEqualTypeOf<SchemaNode['schemaType']>();
expectTypeOf<Hint['nullable']>().toEqualTypeOf<boolean>();
expectTypeOf<Hint['typeMismatch']>().toEqualTypeOf<boolean>();
expectTypeOf<FormTypeInputProps<number>['type']>().toEqualTypeOf<
  NumberNode['type']
>();
expectTypeOf<FormTypeInputProps<number>['schemaType']>().toEqualTypeOf<
  NumberNode['schemaType']
>();
expectTypeOf<
  FormTypeInputProps<number>['typeMismatch']
>().toEqualTypeOf<boolean>();
expectTypeOf<FormTypeInputProps<number>['nullable']>().toEqualTypeOf<boolean>();

const events: SchemaNodeEventType[] = [
  SchemaNodeEventType.UpdateValue,
  SchemaNodeEventType.UpdateState,
  SchemaNodeEventType.UpdateError,
  SchemaNodeEventType.RequestFocus,
  SchemaNodeEventType.RequestSelect,
  SchemaNodeEventType.RequestRemount,
];
const modes: ValidationMode[] = [
  ValidationMode.None,
  ValidationMode.OnChange,
  ValidationMode.OnRequest,
];
void events;
void modes;

expectTypeOf<
  NonNullable<JSONSchema['presentation']>['formType']
>().toEqualTypeOf<string | undefined>();

expectTypeOf<JSONSchema>().toEqualTypeOf<
  CoreJSONSchema<object, SchemaPresentation>
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
        formType: 123,
      },
    },
  },
};
const invalidStringPresentation: import('../index').StringSchema = {
  type: 'string',
  presentation: {
    // @ts-expect-error Per-kind public aliases retain the same presentation shape.
    formType: 123,
  },
};
void invalidNumericConstraint;
void invalidNestedPresentation;
void invalidStringPresentation;

// I12: the removed legacy error name must not return to the package entry.
// @ts-expect-error JSONSchemaError is preserved only for legacy implementation consumers.
type RemovedError = import('../index').JSONSchemaError;
// 70C-01: host and binding channels stay outside the package's consumer surface.
// @ts-expect-error nodeFromJSONSchema is a core-only host entry.
type RemovedHostEntry = typeof import('../index').nodeFromJSONSchema;
// @ts-expect-error buildSchemaNodeTree is binding-only.
type RemovedBindingEntry = typeof import('../index').buildSchemaNodeTree;
expectTypeOf<RemovedError>().toBeAny();
expectTypeOf<RemovedHostEntry>().toBeAny();
expectTypeOf<RemovedBindingEntry>().toBeAny();
