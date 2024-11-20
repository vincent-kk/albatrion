import type { JsonSchema } from './jsonSchema';

export type BooleanValue = boolean;
export type NumberValue = number;
export type StringValue = string;
export type ArrayValue = any[];
export type ObjectValue = Record<string, any>;
export type VirtualNodeValue = any[];

export type AllowedValue =
  | BooleanValue
  | NumberValue
  | StringValue
  | ObjectValue
  | ArrayValue
  | VirtualNodeValue;

export type InferValueType<T extends JsonSchema> = T extends {
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
            : never;
