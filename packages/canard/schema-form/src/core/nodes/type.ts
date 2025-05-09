import type { Fn, SetStateFn } from '@aileron/declare';

import {
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
  BIT_FLAG_05,
  BIT_FLAG_06,
  BIT_FLAG_07,
  BIT_FLAG_08,
  BIT_FLAG_09,
  BIT_FLAG_10,
  BIT_FLAG_11,
  BIT_FLAG_12,
  BIT_FLAG_13,
  BIT_FLAG_14,
  BIT_MASK_NONE,
} from '@/schema-form/app/constants/binary';
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
  None = BIT_MASK_NONE,
  OnChange = BIT_FLAG_01,
  OnRequest = BIT_FLAG_02,
}

export type SchemaNodeFactory<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
> = Fn<[props: NodeFactoryProps<Schema>], SchemaNode>;

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

export interface BranchNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: SchemaNodeFactory;
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

export type NodeListener = Fn<[event: NodeEvent]>;

export type NodeEvent = {
  type: NodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

export enum NodeEventType {
  Activated = BIT_FLAG_01,
  Focus = BIT_FLAG_02,
  Select = BIT_FLAG_03,
  Redraw = BIT_FLAG_04,
  Refresh = BIT_FLAG_05,
  UpdatePath = BIT_FLAG_06,
  UpdateValue = BIT_FLAG_07,
  UpdateState = BIT_FLAG_08,
  UpdateError = BIT_FLAG_09,
  UpdateInternalError = BIT_FLAG_10,
  UpdateChildren = BIT_FLAG_11,
  UpdateDependencies = BIT_FLAG_12,
  UpdateComputedProperties = BIT_FLAG_13,
  RequestValidate = BIT_FLAG_14,
}

export type NodeEventPayload = {
  [NodeEventType.Activated]: void;
  [NodeEventType.Focus]: void;
  [NodeEventType.Select]: void;
  [NodeEventType.Redraw]: void;
  [NodeEventType.Refresh]: void;
  [NodeEventType.UpdatePath]: string;
  [NodeEventType.UpdateValue]: any;
  [NodeEventType.UpdateState]: NodeStateFlags;
  [NodeEventType.UpdateError]: JsonSchemaError[];
  [NodeEventType.UpdateInternalError]: JsonSchemaError[];
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateDependencies]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.RequestValidate]: void;
};

export type NodeEventOptions = {
  [NodeEventType.Activated]: void;
  [NodeEventType.Focus]: void;
  [NodeEventType.Select]: void;
  [NodeEventType.Redraw]: void;
  [NodeEventType.Refresh]: void;
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
  [NodeEventType.UpdateInternalError]: void;
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateDependencies]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.RequestValidate]: void;
};

export enum NodeState {
  Dirty = BIT_FLAG_01,
  Touched = BIT_FLAG_02,
  ShowError = BIT_FLAG_03,
}

export type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.ShowError]?: boolean;
  [key: string]: any;
};

export enum SetValueOption {
  /** Only update the value */
  None = BIT_MASK_NONE,
  /** Update the value and trigger onChange */
  EmitChange = BIT_FLAG_01,
  /** Replace the current value */
  Replace = BIT_FLAG_02,
  /** Propagate the update to child nodes */
  Propagate = BIT_FLAG_03,
  /** Trigger a refresh to update the FormTypeInput */
  Refresh = BIT_FLAG_04,
  /** Reset the node */
  External = BIT_FLAG_05,
  /** Both propagate to children and trigger a refresh */
  Merge = EmitChange | Propagate | Refresh | External,
  /** Replace the value and propagate the update with refresh */
  Overwrite = EmitChange | Replace | Propagate | Refresh | External,
}
