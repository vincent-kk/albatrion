import type { Fn } from '@aileron/declare';

import {
  BIT_FLAG_00,
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
} from '@/schema-form/app/constants/bitmask';
import type {
  AllowedValue,
  ArraySchema,
  BooleanSchema,
  InferValueType,
  JsonSchemaError,
  JsonSchemaWithRef,
  JsonSchemaWithVirtual,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  ValidatorFactory,
  VirtualSchema,
} from '@/schema-form/types';

import type { ArrayNode } from './ArrayNode';
import type { BooleanNode } from './BooleanNode';
import type { NullNode } from './NullNode';
import type { NumberNode } from './NumberNode';
import type { ObjectNode } from './ObjectNode';
import type { StringNode } from './StringNode';
import type { VirtualNode } from './VirtualNode';

/**
 * Compile-time utility that maps a JSON Schema to its concrete `SchemaNode` implementation.
 * Falls back to the broad `SchemaNode` union when the schema type cannot be narrowed.
 * @typeParam Schema - JSON Schema used as the basis for node inference
 */
export type InferSchemaNode<Schema extends JsonSchemaWithVirtual | unknown> =
  Schema extends ArraySchema
    ? ArrayNode
    : Schema extends NumberSchema
      ? NumberNode
      : Schema extends ObjectSchema
        ? ObjectNode
        : Schema extends StringSchema
          ? StringNode
          : Schema extends BooleanSchema
            ? BooleanNode
            : Schema extends VirtualSchema
              ? VirtualNode
              : Schema extends NullSchema
                ? NullNode
                : SchemaNode;

/** Discriminated union of all concrete schema node implementations. */
export type SchemaNode =
  | ArrayNode
  | NumberNode
  | ObjectNode
  | StringNode
  | BooleanNode
  | VirtualNode
  | NullNode;

/**
 * Represents a child entry inside a branch node (e.g., `ObjectNode`, `ArrayNode`).
 * Optional metadata assists with identity and rendering strategies for children.
 */
export interface ChildNode {
  key?: string;
  salt?: string;
  virtual?: boolean;
  node: SchemaNode;
}

export enum ValidationMode {
  /** Disable validation for this node. */
  None = BIT_MASK_NONE,
  /** Run validation on every value mutation (e.g., on input change). */
  OnChange = BIT_FLAG_00,
  /** Defer validation until explicitly requested by the caller. */
  OnRequest = BIT_FLAG_01,
}

/**
 * Factory signature used to produce a concrete `SchemaNode` from factory props.
 * Typically used by branch nodes to instantiate children, resolving `$ref` and virtual nodes as needed.
 * @typeParam Schema - JSON Schema type of the node to be created
 */
export type SchemaNodeFactory<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
> = Fn<[props: NodeFactoryProps<Schema>], SchemaNode>;

export type HandleChange<Value = any> = Fn<[value: Value, batch?: boolean]>;

/**
 * Constructor properties shared by all concrete `SchemaNode` implementations.
 * @typeParam Schema - Node's JSON Schema type
 * @typeParam Value - Node's value type inferred from the schema
 * @property key - Optional stable key for list rendering and reconciliation
 * @property name - Optional human-readable identifier for diagnostics/UI
 * @property jsonSchema - The JSON Schema definition backing this node
 * @property defaultValue - Initial value applied before user interaction
 * @property onChange - Callback invoked when the node's value changes
 * @property parentNode - Parent in the node graph; undefined for the root
 * @property validationMode - Validation strategy for this node
 * @property validatorFactory - Provides validators compatible with the schema
 * @property required - Indicates whether the value is required by its parent
 */
export interface SchemaNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  key?: string;
  name?: string;
  scope?: number;
  jsonSchema: Schema;
  defaultValue?: Value;
  onChange: HandleChange<Value>;
  parentNode?: SchemaNode;
  validationMode?: ValidationMode;
  validatorFactory?: ValidatorFactory;
  required?: boolean;
}

/**
 * Additional constructor properties for branch nodes that can own children.
 * @typeParam Schema - Node's JSON Schema type
 * @property nodeFactory - Factory used to construct child nodes
 */
export interface BranchNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: SchemaNodeFactory;
}

/**
 * Additional constructor properties for virtual nodes.
 * @typeParam Schema - Node's JSON Schema type
 * @property refNodes - External nodes referenced by this virtual node
 */
export interface VirtualNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

/**
 * Props supplied to a `SchemaNodeFactory` call.
 * Combines constructor options while replacing `jsonSchema` with a `$ref`-capable schema.
 * @typeParam Schema - Node's JSON Schema type
 */
export type NodeFactoryProps<Schema extends JsonSchemaWithVirtual> = Omit<
  SchemaNodeConstructorProps<Schema> &
    BranchNodeConstructorProps<Schema> &
    VirtualNodeConstructorProps<Schema>,
  'jsonSchema'
> & {
  jsonSchema: JsonSchemaWithRef;
};

/** Callback signature invoked when a `NodeEvent` is published by a node. */
export type NodeListener = Fn<[event: NodeEventCollection]>;

export type NodeEventEntity<Type extends NodeEventType = NodeEventType> = [
  type: Type,
  payload?: NodeEventPayload[Type],
  options?: NodeEventOptions[Type],
];

export type NodeEventCollection = {
  type: UnionNodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

export enum NodeEventType {
  /** Node becomes the initialized target within the form graph. */
  Initialized = BIT_FLAG_00,
  /** Node's absolute path within the form graph has changed. */
  UpdatePath = BIT_FLAG_01,
  /** Node's value has changed. */
  UpdateValue = BIT_FLAG_02,
  /** Node's UI state flags have changed. */
  UpdateState = BIT_FLAG_03,
  /** Node's validation errors have changed. */
  UpdateError = BIT_FLAG_04,
  /** Node's global/aggregate errors have changed. */
  UpdateGlobalError = BIT_FLAG_05,
  /** Children collection has changed (add/remove/reorder). */
  UpdateChildren = BIT_FLAG_06,
  /** Derived/computed properties have changed. */
  UpdateComputedProperties = BIT_FLAG_07,
  /** Input element associated with the node receives focus. */
  Focused = BIT_FLAG_08,
  /** Input element loses focus. */
  Blurred = BIT_FLAG_09,
  /** Request the input element to receive focus. */
  RequestFocus = BIT_FLAG_10,
  /** Request selection on the input element. */
  RequestSelect = BIT_FLAG_11,
  /** Request a refresh of the input element. */
  RequestRefresh = BIT_FLAG_12,
  /** Request to emit a value change with a specific strategy. */
  RequestEmitChange = BIT_FLAG_13,
  /** Request validation to run for this node. */
  RequestValidate = BIT_FLAG_14,
}

export enum PublicNodeEventType {
  /** Public notification that the node's value has changed. */
  UpdateValue = NodeEventType.UpdateValue,
  /** Public notification that the node's state flags changed. */
  UpdateState = NodeEventType.UpdateState,
  /** Public notification that the node's validation errors changed. */
  UpdateError = NodeEventType.UpdateError,
  /** Public request to focus the node's input. */
  RequestFocus = NodeEventType.RequestFocus,
  /** Public request to select the node's input. */
  RequestSelect = NodeEventType.RequestSelect,
}

/** Union of internal and public node event types. */
export type UnionNodeEventType = NodeEventType | PublicNodeEventType;

/**
 * Mapping from `NodeEventType` to the expected payload type for each event.
 * Events that do not carry additional data use `void`.
 */
export type NodeEventPayload = {
  [NodeEventType.Initialized]: void;
  [NodeEventType.UpdatePath]: string;
  [NodeEventType.UpdateValue]: any;
  [NodeEventType.UpdateState]: NodeStateFlags;
  [NodeEventType.UpdateError]: JsonSchemaError[];
  [NodeEventType.UpdateGlobalError]: JsonSchemaError[];
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.Focused]: void;
  [NodeEventType.Blurred]: void;
  [NodeEventType.RequestFocus]: void;
  [NodeEventType.RequestSelect]: void;
  [NodeEventType.RequestRefresh]: void;
  [NodeEventType.RequestEmitChange]: UnionSetValueOption;
  [NodeEventType.RequestValidate]: void;
};

/**
 * Optional metadata accompanying an event publication.
 * Enables consumers to access previous/current values or auxiliary context.
 */
export type NodeEventOptions = {
  [NodeEventType.Initialized]: void;
  [NodeEventType.UpdatePath]: {
    previous: string;
    current: string;
  };
  [NodeEventType.UpdateValue]: {
    previous: any;
    current: any;
    settled?: boolean;
  };
  [NodeEventType.UpdateState]: void;
  [NodeEventType.UpdateError]: void;
  [NodeEventType.UpdateGlobalError]: void;
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.Focused]: void;
  [NodeEventType.Blurred]: void;
  [NodeEventType.RequestFocus]: void;
  [NodeEventType.RequestSelect]: void;
  [NodeEventType.RequestRefresh]: void;
  [NodeEventType.RequestEmitChange]: boolean;
  [NodeEventType.RequestValidate]: void;
};

export enum NodeState {
  /** Value diverged from its initial/default state. */
  Dirty = BIT_FLAG_00,
  /** Node interacted with (e.g., focused/blurred) at least once. */
  Touched = BIT_FLAG_01,
  /** UI should display validation messages for this node. */
  ShowError = BIT_FLAG_02,
}

/** Typed bag of boolean-like UI state flags carried by a node. */
export type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.ShowError]?: boolean;
  [key: string]: any;
};

export enum SetValueOption {
  /** Replace the current value */
  Replace = BIT_FLAG_00,
  /** Update the value and trigger onChange */
  EmitChange = BIT_FLAG_01,
  /** Update the value and publish UpdateValue event */
  Propagate = BIT_FLAG_02,
  /** Propagate the update to child nodes */
  Refresh = BIT_FLAG_03,
  /** Update the value with batch mode */
  Batch = BIT_FLAG_04,
  /** Ignore node tree update cycle */
  Isolate = BIT_FLAG_05,
  /** Trigger a refresh to update the FormTypeInput */
  PublishUpdateEvent = BIT_FLAG_06,
  /** Update the value and trigger onChange with batch mode */
  BatchedEmitChange = EmitChange | Batch,
  /** Reset the node to its initial value */
  ResetNode = Replace | Propagate | Refresh | BatchedEmitChange,
  /** Default SetValue option */
  Default = EmitChange | PublishUpdateEvent,
  /** Default SetValue option with batch mode */
  BatchDefault = Batch | Default,
  /** Both propagate to children and trigger a refresh */
  Merge = Propagate | Refresh | Isolate | BatchDefault,
  /** Replace the value and propagate the update with refresh */
  Overwrite = Replace | Merge,
}

export enum PublicSetValueOption {
  /** Both propagate to children and trigger a refresh */
  Merge = SetValueOption.Merge,
  /** Replace the value and propagate the update with refresh */
  Overwrite = SetValueOption.Overwrite,
}

/** Union of internal and public `SetValueOption` flags. */
export type UnionSetValueOption = SetValueOption | PublicSetValueOption;
