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

export enum ValidationMode {
  None = 0,
  OnChange = 1 << 1,
  OnRequest = 1 << 2,
}
export interface SchemaNodeConstructorProps<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  key?: string;
  name?: string;
  jsonSchema: Schema;
  defaultValue?: Value;
  onChange?: SetStateFn<Value>;
  parentNode?: SchemaNode;
  validationMode?: ValidationMode;
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
  [K in NodeMethod]: {
    type: K;
    payload?: MethodPayload[K];
    options?: MethodOptions[K];
  };
}[NodeMethod];

export enum NodeMethod {
  Focus = 1 << 0,
  Select = 1 << 1,
  Redraw = 1 << 2,
  Change = 1 << 3,
  Validate = 1 << 4,
  PathChange = 1 << 5,
  StateChange = 1 << 6,
  UpdateError = 1 << 7,
  ChildrenChange = 1 << 8,
}

export type MethodPayload = {
  [NodeMethod.Focus]: void;
  [NodeMethod.Select]: void;
  [NodeMethod.Redraw]: void;
  [NodeMethod.Change]: any;
  [NodeMethod.Validate]: void;
  [NodeMethod.PathChange]: string;
  [NodeMethod.StateChange]: NodeStateFlags;
  [NodeMethod.UpdateError]: JsonSchemaError[];
  [NodeMethod.ChildrenChange]: void;
};

export type MethodOptions = Partial<{
  [NodeMethod.Focus]: void;
  [NodeMethod.Select]: void;
  [NodeMethod.Redraw]: void;
  [NodeMethod.Change]: {
    previous: any;
    current: any;
    difference?: any;
  };
  [NodeMethod.Validate]: void;
  [NodeMethod.PathChange]: {
    previous: string;
    current: string;
  };
  [NodeMethod.StateChange]: void;
  [NodeMethod.UpdateError]: void;
  [NodeMethod.ChildrenChange]: void;
}>;

export enum NodeState {
  Dirty = 1 << 0,
  Touched = 1 << 1,
  ShowError = 1 << 2,
}

export type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.ShowError]?: boolean;
  [key: string]: any;
};
