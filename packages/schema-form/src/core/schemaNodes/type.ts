import type {
  ArraySchema,
  BooleanSchema,
  ExpectJsonSchema,
  JsonSchema,
  JsonSchemaError,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  VirtualSchema,
} from '@lumy/schema-form/types';
import type { Ajv } from 'ajv';

import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';

export type ExpectSchemaNode<S extends JsonSchema | unknown> =
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

export type ConstructorProps<V = any, S = unknown> = NodeFactoryProps<
  S extends JsonSchema ? S : ExpectJsonSchema<V>,
  V
>;

export interface NodeFactoryProps<S extends JsonSchema = JsonSchema, V = any> {
  schema: S;
  key?: string;
  name?: string;
  defaultValue?: V;
  onChange: (value: V | undefined) => void;
  parentNode?: SchemaNode;
  refNodes?: SchemaNode[];
  ajv?: Ajv;
}

export interface ConstructorPropsWithNodeFactory<
  V extends any[] | Record<string, any> = any,
> extends ConstructorProps<V> {
  nodeFactory: any;
}

export interface Listener {
  <T extends MethodType>(type: T, payload: MethodPayload[T]): void;
}

export const enum MethodType {
  Focus = 2 << 0,
  Select = 2 << 1,
  Redraw = 2 << 2,
  Change = 2 << 3,
  PathChange = 2 << 4,
  StateChange = 2 << 5,
  Validate = 2 << 6,
}

export type MethodPayload = {
  [MethodType.Focus]: null;
  [MethodType.Select]: null;
  [MethodType.Redraw]: undefined;
  [MethodType.Change]: any;
  [MethodType.PathChange]: string;
  [MethodType.StateChange]: any;
  [MethodType.Validate]: JsonSchemaError[];
};
