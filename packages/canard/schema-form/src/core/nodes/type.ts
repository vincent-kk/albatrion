import type { SetStateFn } from '@aileron/declare';

import type { Ajv } from '@/schema-form/helpers/ajv';
import type {
  AllowedValue,
  ArraySchema,
  BooleanSchema,
  InferValueType,
  JsonSchemaError,
  JsonSchemaWithVirtual,
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

export type InferSchemaNode<S extends JsonSchemaWithVirtual | unknown> =
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
  Schema extends JsonSchemaWithVirtual,
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

export interface BranchNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: NodeFactory;
}

export interface VirtualNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

export type NodeFactoryProps<Schema extends JsonSchemaWithVirtual> =
  SchemaNodeConstructorProps<Schema> &
    BranchNodeConstructorProps<Schema> &
    VirtualNodeConstructorProps<Schema>;

export interface Listener {
  (event: NodeEvent): void;
}

export type NodeEvent = {
  type: NodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

export enum NodeEventType {
  Focus = 1 << 0,
  Select = 1 << 1,
  Redraw = 1 << 2,
  Refresh = 1 << 3,
  Validate = 1 << 4,
  UpdatePath = 1 << 5,
  UpdateValue = 1 << 6,
  UpdateState = 1 << 7,
  UpdateError = 1 << 8,
  UpdateChildren = 1 << 9,
  UpdateDependencies = 1 << 10,
  UpdateComputedProperties = 1 << 11,
}

export type NodeEventPayload = {
  [NodeEventType.Focus]: void;
  [NodeEventType.Select]: void;
  [NodeEventType.Redraw]: void;
  [NodeEventType.Refresh]: void;
  [NodeEventType.Validate]: void;
  [NodeEventType.UpdatePath]: string;
  [NodeEventType.UpdateValue]: any;
  [NodeEventType.UpdateState]: NodeStateFlags;
  [NodeEventType.UpdateError]: JsonSchemaError[];
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateDependencies]: void;
  [NodeEventType.UpdateComputedProperties]: void;
};

export type NodeEventOptions = {
  [NodeEventType.Focus]: void;
  [NodeEventType.Select]: void;
  [NodeEventType.Redraw]: void;
  [NodeEventType.Refresh]: void;
  [NodeEventType.Validate]: void;
  [NodeEventType.UpdatePath]: {
    previous: string;
    current: string;
  };
  [NodeEventType.UpdateValue]: {
    previous: any;
    current: any;
  };
  [NodeEventType.UpdateState]: void;
  [NodeEventType.UpdateError]: void;
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateDependencies]: void;
  [NodeEventType.UpdateComputedProperties]: void;
};

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
