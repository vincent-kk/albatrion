import type { Ajv } from '@lumy/schema-form/helpers/ajv';
import type {
  AllowedValue,
  ArraySchema,
  BooleanSchema,
  InferValueType,
  JsonSchema,
  JsonSchemaError,
  NumberSchema,
  ObjectSchema,
  ShowError,
  StringSchema,
  VirtualSchema,
} from '@lumy/schema-form/types';

import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';

export type InferSchemaNode<S extends JsonSchema | unknown> =
  S extends ArraySchema
    ? ArrayNode
    : S extends NumberSchema
      ? NumberNode
      : S extends ObjectSchema
        ? ObjectNode
        : S extends StringSchema
          ? StringNode
          : S extends BooleanSchema
            ? BooleanNode
            : S extends VirtualSchema
              ? VirtualNode
              : SchemaNode;

export type SchemaNode =
  | ArrayNode
  | NumberNode
  | ObjectNode
  | StringNode
  | BooleanNode
  | VirtualNode;

export interface SchemaNodeConstructorProps<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  key?: string;
  name?: string;
  jsonSchema: Schema;
  defaultValue?: Value;
  onChange?: SetStateFn<Value | undefined>;
  parentNode?: SchemaNode;
  ajv?: Ajv;
}

export interface VirtualNodeConstructorProps<Schema extends JsonSchema>
  extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

export type NodeFactoryProps<Schema extends JsonSchema> =
  SchemaNodeConstructorProps<Schema> & VirtualNodeConstructorProps<Schema>;

export interface Listener {
  <T extends MethodType>(type: T, payload: MethodPayload[T]): void;
}

export enum MethodType {
  Focus = 1 << 0,
  Select = 1 << 1,
  Redraw = 1 << 2,
  Change = 1 << 3,
  PathChange = 1 << 4,
  StateChange = 1 << 5,
  Validate = 1 << 6,
}

export type MethodPayload = {
  [MethodType.Focus]: void;
  [MethodType.Select]: void;
  [MethodType.Redraw]: void;
  [MethodType.Change]: any;
  [MethodType.PathChange]: string;
  [MethodType.StateChange]: NodeState;
  [MethodType.Validate]: JsonSchemaError[];
};

export type NodeState = {
  [ShowError.Touched]?: boolean;
  [ShowError.Dirty]?: boolean;
  [key: string]: any;
};
