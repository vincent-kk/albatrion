import type { JsonSchemaWithVirtual } from './jsonSchema';

export type BooleanValue = boolean;
export type NumberValue = number;
export type StringValue = string;
export type ArrayValue = any[];
export type ObjectValue = Record<string, any>;
export type VirtualNodeValue = any[];
export type NullValue = null;
export type UndefinedValue = undefined;

export type AllowedValue =
  | BooleanValue
  | NumberValue
  | StringValue
  | ObjectValue
  | ArrayValue
  | VirtualNodeValue
  | NullValue
  | UndefinedValue;

export type InferValueType<T extends JsonSchemaWithVirtual> = T extends {
  type: 'string';
}
  ? StringValue
  : T extends { type: 'number' | 'integer' }
    ? NumberValue
    : T extends { type: 'boolean' }
      ? BooleanValue
      : T extends { type: 'array' }
        ? ArrayValue
        : T extends { type: 'object' }
          ? ObjectValue
          : T extends { type: 'virtual' }
            ? VirtualNodeValue
            : T extends { type: 'null' }
              ? NullValue
              : UndefinedValue;

export type Formatter<Value> = (
  value: Value | undefined,
  info?: {
    userTyping: boolean;
    input: string;
  },
) => string;

export type Parser<Value> = (value: string | undefined) => Value;
