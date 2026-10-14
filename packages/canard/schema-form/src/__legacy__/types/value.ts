import type {
  AllowedValue as BaseAllowedValue,
  InferValueType as BaseInferValueType,
} from '@winglet/json-schema';

export type VirtualNodeValue = any[];

export type AllowedValue = BaseAllowedValue | VirtualNodeValue;

/** Preserve the existing typed-schema inference, including tuple normalization. */
type NormalizeType<Schema> = {
  [Key in keyof Schema]: Key extends 'type'
    ? Schema[Key] extends readonly string[]
      ? [...Schema[Key]]
      : Schema[Key]
    : Schema[Key];
};

/** The existing loose inference for shapes that cannot be narrowed statically. */
type BroadValue = BaseInferValueType<{ type?: string }>;

/** Maps JSON literal values to their primitive kinds. */
type LiteralKind<Value> = Value extends string
  ? 'string'
  : Value extends number
    ? 'number'
    : Value extends boolean
      ? 'boolean'
      : Value extends null
        ? 'null'
        : 'unsupported';

/** True only for one statically known primitive kind plus optional null. */
type HasSingleLiteralKind<Value> = [
  Exclude<LiteralKind<Value>, 'null'>,
] extends [never]
  ? true
  : [Exclude<LiteralKind<Value>, 'null'>] extends ['string']
    ? true
    : [Exclude<LiteralKind<Value>, 'null'>] extends ['number']
      ? true
      : [Exclude<LiteralKind<Value>, 'null'>] extends ['boolean']
        ? true
        : false;

/** Classifies only an explicitly authored inline branch type. */
type InlineTypeKind<Type> = Type extends
  | 'object'
  | 'array'
  | 'null'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  ? Type
  : Type extends readonly string[]
    ? [Type[number]] extends [never]
      ? 'unsupported'
      : [Exclude<Type[number], 'null'>] extends [never]
        ? 'null'
        : [Exclude<Type[number], 'null'>] extends ['object']
          ? 'object'
          : [Exclude<Type[number], 'null'>] extends ['array']
            ? 'array'
            : 'unsupported'
    : 'unsupported';

/** Marks refs and gated branches as beyond public static inference. */
type InlineBranchKind<Branch> = Branch extends { $ref: unknown }
  ? 'unsupported'
  : Branch extends {
        controls: { active: unknown } | { discriminator: unknown };
      }
    ? 'unsupported'
    : Branch extends { type: infer Type }
      ? InlineTypeKind<Type>
      : 'unsupported';

/** Identifies a statically invalid object/array mixture without guessing refs. */
type HasMixedContainer<Kind> = 'unsupported' extends Kind
  ? false
  : 'object' extends Kind
    ? [Exclude<Kind, 'object' | 'null'>] extends [never]
      ? false
      : true
    : 'array' extends Kind
      ? [Exclude<Kind, 'array' | 'null'>] extends [never]
        ? false
        : true
      : false;

/** Only a nonempty homogeneous inline branch tuple is statically narrowed. */
type InlineHostValue<Branches> = Branches extends readonly [unknown, ...unknown[]]
  ? InlineBranchKind<Branches[number]> extends infer Kind
    ? HasMixedContainer<Kind> extends true
      ? unknown
      : [Kind] extends ['object' | 'null']
      ? 'object' extends Kind
        ? InferValueType<Branches[number]>
        : null
      : [Kind] extends ['array' | 'null']
        ? 'array' extends Kind
          ? InferValueType<Branches[number]>
          : null
        : BroadValue
    : BroadValue
  : BroadValue;

/** `const` wins over enum for a branch-free literal-only schema. */
type LiteralValue<Schema> = Schema extends { const: infer Value }
  ? 'unsupported' extends LiteralKind<Value>
    ? unknown
    : HasSingleLiteralKind<Value> extends true
    ? Value
    : BroadValue
  : Schema extends { enum: infer Values }
    ? Values extends readonly [unknown, ...unknown[]]
      ? HasSingleLiteralKind<Values[number]> extends true
        ? Values[number]
        : unknown
      : Values extends readonly []
        ? unknown
        : BroadValue
    : BroadValue;

/** Infer authored typed values, inline variants and branch-free literal fields. */
export type InferValueType<T> = T extends { type: 'virtual' }
  ? VirtualNodeValue
  : T extends { type: unknown }
    ? T extends { type?: string | readonly string[] | string[] }
      ? BaseInferValueType<NormalizeType<T>>
      : BroadValue
    : T extends
          | { $ref: unknown }
          | { allOf: unknown }
          | { controls: { discriminator: unknown } }
      ? BroadValue
      : T extends { oneOf: infer Branches }
        ? T extends { anyOf: unknown }
          ? BroadValue
          : InlineHostValue<Branches>
        : T extends { anyOf: infer Branches }
          ? InlineHostValue<Branches>
          : LiteralValue<T>;

export type {
  BooleanValue,
  NumberValue,
  StringValue,
  ArrayValue,
  ObjectValue,
  NullValue,
  UndefinedValue,
} from '@winglet/json-schema';
