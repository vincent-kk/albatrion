import type {
  AllowedValue as BaseAllowedValue,
  InferValueType as BaseInferValueType,
} from '@winglet/json-schema';

export type VirtualNodeValue = any[];

export type AllowedValue = BaseAllowedValue | VirtualNodeValue;

/** Normalize readonly string[] to string[] for BaseInferValueType compatibility */
type NormalizeType<T> = T extends { type?: infer U }
  ? U extends readonly string[]
    ? { type?: string[] } & Omit<T, 'type'>
    : T
  : T;

export type InferValueType<
  T extends { type?: string | readonly string[] | string[] },
> = T extends {
  type: 'virtual';
}
  ? VirtualNodeValue
  : BaseInferValueType<NormalizeType<T> & { type?: string | string[] }>;

export type {
  BooleanValue,
  NumberValue,
  StringValue,
  ArrayValue,
  ObjectValue,
  NullValue,
  UndefinedValue,
} from '@winglet/json-schema';
