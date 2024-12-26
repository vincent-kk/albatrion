import type { SetStateFn } from '@aileron/types';

import type { Ajv } from '@/schema-form/helpers/ajv';
import type {
  AllowedValue,
  ArraySchema,
  BooleanSchema,
  InferValueType,
  JsonSchema,
  JsonSchemaError,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  ShowError,
  StringSchema,
  VirtualSchema,
} from '@/schema-form/types';

import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NullNode } from './NullNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';
import type { schemaNodeFactory } from './schemaNodeFactory';

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
              : S extends NullSchema
                ? NullNode
                : SchemaNode;

export type SchemaNode =
  | ArrayNode
  | NumberNode
  | ObjectNode
  | StringNode
  | BooleanNode
  | VirtualNode
  | NullNode;

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

export type NodeFactory = typeof schemaNodeFactory;

export interface BranchNodeConstructorProps<Schema extends JsonSchema>
  extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: NodeFactory;
}

export interface VirtualNodeConstructorProps<Schema extends JsonSchema>
  extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

export type NodeFactoryProps<Schema extends JsonSchema> =
  SchemaNodeConstructorProps<Schema> &
    BranchNodeConstructorProps<Schema> &
    VirtualNodeConstructorProps<Schema>;

export interface Listener {
  (event: MethodEvent): void;
}

export type MethodEvent = {
  [K in MethodType]: {
    type: K;
    payload?: MethodPayload[K];
    options?: MethodOptions[K];
  };
}[MethodType];

export enum MethodType {
  Focus = 1 << 0,
  Select = 1 << 1,
  Redraw = 1 << 2,
  Change = 1 << 3,
  PathChange = 1 << 4,
  StateChange = 1 << 5,
  Validate = 1 << 6,
  ChildrenChange = 1 << 7,
}

export type MethodPayload = {
  [MethodType.Focus]: void;
  [MethodType.Select]: void;
  [MethodType.Redraw]: void;
  [MethodType.Change]: any;
  [MethodType.PathChange]: string;
  [MethodType.StateChange]: NodeState;
  [MethodType.Validate]: JsonSchemaError[];
  [MethodType.ChildrenChange]: void;
};

export type MethodOptions = Partial<{
  [MethodType.Focus]: void;
  [MethodType.Select]: void;
  [MethodType.Redraw]: void;
  [MethodType.Change]: {
    previous: any;
    current: any;
    difference?: any;
  };
  [MethodType.PathChange]: {
    previous: string;
    current: string;
  };
  [MethodType.StateChange]: void;
  [MethodType.Validate]: void;
  [MethodType.ChildrenChange]: void;
}>;

export type NodeState = {
  [ShowError.Touched]?: boolean;
  [ShowError.Dirty]?: boolean;
  [key: string]: any;
};
