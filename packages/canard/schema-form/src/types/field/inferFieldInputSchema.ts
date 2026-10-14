import type { Dictionary, IsNullable } from '@aileron/declare';

import type {
  JSONSchema,
  JSONSchemaWithVirtual,
  NonNullableArraySchema,
  NonNullableBooleanSchema,
  NonNullableNumberSchema,
  NonNullableObjectSchema,
  NonNullableStringSchema,
  NullSchema,
  NullableArraySchema,
  NullableBooleanSchema,
  NullableNumberSchema,
  NullableObjectSchema,
  NullableStringSchema,
  VirtualNodeSchema,
} from '../schema/jsonSchema';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
  VirtualNodeValue,
} from '../schema/value';

/** Schema inference for non-nullable values */
type InferNonNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NonNullableNumberSchema<Options>
  : Value extends StringValue
    ? NonNullableStringSchema<Options>
    : Value extends BooleanValue
      ? NonNullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NonNullableArraySchema<Options>
        : Value extends ObjectValue
          ? NonNullableObjectSchema<Options>
          : Value extends VirtualNodeValue
            ? VirtualNodeSchema<Options>
            : JSONSchemaWithVirtual<Options>;

/** Schema inference for nullable values (a virtual node is never nullable) */
type InferNullableSchema<
  Value,
  Options extends Dictionary = object,
> = Value extends NumberValue
  ? NullableNumberSchema<Options>
  : Value extends StringValue
    ? NullableStringSchema<Options>
    : Value extends BooleanValue
      ? NullableBooleanSchema<Options>
      : Value extends ArrayValue
        ? NullableArraySchema<Options>
        : Value extends ObjectValue
          ? NullableObjectSchema<Options>
          : NullSchema<Options>;

/** Collects each admitted JSON kind once, without distributing the resulting schema. */
type InferredKinds<Value> = readonly [
  ...([Extract<Value, string>] extends [never] ? [] : ['string']),
  ...([Extract<Value, number>] extends [never] ? [] : ['number']),
  ...([Extract<Value, boolean>] extends [never] ? [] : ['boolean']),
  ...([Extract<Value, ArrayValue>] extends [never] ? [] : ['array']),
  ...([Extract<Exclude<Value, ArrayValue>, ObjectValue>] extends [never]
    ? []
    : ['object']),
];

/** A multi-kind value belongs to one terminal schema, including its nullable flag. */
type UnionSchema<Value, Options extends Dictionary> = Omit<
  JSONSchema<Options>,
  'type'
> & {
  type: readonly [
    ...InferredKinds<Value>,
    ...(null extends Value ? ['null'] : []),
  ];
};

/**
 * Infers the appropriate Schema type based on the input value.
 * - For multiple non-null kinds, returns one union schema
 * - For nullable types (T | null), returns the corresponding Nullable schema
 * - For non-nullable types, returns the standard schema
 * - For pure null type, returns NullSchema
 */
export type InferFieldInputSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = unknown extends Value
  ? JSONSchema<Options>
  : InferredKinds<Exclude<Value, null>> extends readonly [
        unknown,
        unknown,
        ...unknown[],
      ]
    ? UnionSchema<Value, Options>
    : [Value] extends [null]
      ? NullSchema<Options>
      : IsNullable<Value> extends true
        ? InferNullableSchema<Exclude<Value, null>, Options>
        : InferNonNullableSchema<Value, Options>;
