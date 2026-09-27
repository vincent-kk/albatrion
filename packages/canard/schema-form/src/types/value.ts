import type {
  AllowedValue as BaseAllowedValue,
  InferValueType as BaseInferValueType,
} from '@winglet/json-schema';

export type VirtualNodeValue = any[];

export type AllowedValue = BaseAllowedValue | VirtualNodeValue;

/** Preserve type literals and property modifiers while removing tuple readonly. */
type NormalizeType<T> = {
  [Key in keyof T]: Key extends 'type'
    ? T[Key] extends readonly string[]
      ? [...T[Key]]
      : T[Key]
    : T[Key];
};

export type InferValueType<
  T extends { type?: string | readonly string[] | string[] },
> = T extends {
  type: 'virtual';
}
  ? VirtualNodeValue
  : BaseInferValueType<NormalizeType<T>>;

export type {
  BooleanValue,
  NumberValue,
  StringValue,
  ArrayValue,
  ObjectValue,
  NullValue,
  UndefinedValue,
} from '@winglet/json-schema';
