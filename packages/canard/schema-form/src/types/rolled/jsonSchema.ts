import type { RefSchema } from '@winglet/json-schema';

import type { Dictionary, Roll } from '@aileron/declare';

import type {
  ArraySchema as BaseArraySchema,
  BooleanSchema as BaseBooleanSchema,
  NullSchema as BaseNullSchema,
  NumberSchema as BaseNumberSchema,
  ObjectSchema as BaseObjectSchema,
  StringSchema as BaseStringSchema,
} from '../jsonSchema';
import type {
  AllowedValue,
  ArrayValue,
  BooleanValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from '../value';

type BooleanSchema<Options extends object = object> = Roll<
  BaseBooleanSchema<Options>
>;
type NumberSchema<Options extends object = object> = Roll<
  BaseNumberSchema<Options>
>;
type StringSchema<Options extends object = object> = Roll<
  BaseStringSchema<Options>
>;
type ArraySchema<Options extends object = object> = Roll<
  BaseArraySchema<Options>
>;
type ObjectSchema<Options extends object = object> = Roll<
  BaseObjectSchema<Options>
>;
type NullSchema<Options extends object = object> = Roll<
  BaseNullSchema<Options>
>;

export type {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  ArraySchema,
  ObjectSchema,
  NullSchema,
};

export type JsonSchema<Options extends Dictionary = object> =
  | NumberSchema<Options>
  | StringSchema<Options>
  | BooleanSchema<Options>
  | ArraySchema<Options>
  | ObjectSchema<Options>
  | NullSchema<Options>
  | RefSchema;

export type InferJsonSchema<
  Value extends AllowedValue | unknown = any,
  Options extends Dictionary = object,
> = Value extends NumberValue | undefined
  ? NumberSchema<Options>
  : Value extends StringValue | undefined
    ? StringSchema<Options>
    : Value extends BooleanValue | undefined
      ? BooleanSchema<Options>
      : Value extends ArrayValue | undefined
        ? ArraySchema<Options>
        : Value extends ObjectValue | undefined
          ? ObjectSchema<Options>
          : Value extends null | undefined
            ? NullSchema<Options>
            : JsonSchema<Options>;
