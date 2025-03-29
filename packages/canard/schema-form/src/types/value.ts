import type {
  AllowedValue as BaseAllowedValue,
  InferValueType as BaseInferValueType,
} from '@winglet/json-schema';

export type VirtualNodeValue = any[];

export type AllowedValue = BaseAllowedValue | VirtualNodeValue;

export type InferValueType<T extends { type?: string }> = T extends {
  type: 'virtual';
}
  ? VirtualNodeValue
  : BaseInferValueType<T>;

export type Formatter<Value> = (
  value: Value | undefined,
  info?: {
    userTyping: boolean;
    input: string;
  },
) => string;

export type Parser<Value> = (value: string | undefined) => Value;

export type {
  BooleanValue,
  NumberValue,
  StringValue,
  ArrayValue,
  ObjectValue,
  NullValue,
  UndefinedValue,
} from '@winglet/json-schema';
