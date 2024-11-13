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
  | VirtualNodeValue;
