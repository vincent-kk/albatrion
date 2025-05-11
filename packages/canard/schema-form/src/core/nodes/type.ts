import type { Fn, SetStateFn } from '@aileron/declare';

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
  BIT_MASK_NONE,
} from '@/schema-form/app/constants/bitmask';
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

/**
 * JSON Schema 타입에서 해당하는 SchemaNode 타입을 추론합니다.
 * @typeParam S - 추론의 기준이 되는 JSON Schema 타입
 */
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

/**
 * 모든 스키마 노드 타입을 합치는 유니언 타입입니다.
 */
export type SchemaNode =
  | ArrayNode
  | NumberNode
  | ObjectNode
  | StringNode
  | BooleanNode
  | VirtualNode
  | NullNode;

export enum ValidationMode {
  /** No validation */
  None = BIT_MASK_NONE,
  /** Validate on value change */
  OnChange = BIT_FLAG_00,
  /** Validate on request */
  OnRequest = BIT_FLAG_01,
}

/**
 * SchemaNode를 생성하는 팩토리 함수 타입입니다.
 * @typeParam Schema - 생성할 노드의 JSON Schema 타입
 */
export type SchemaNodeFactory<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
> = Fn<[props: NodeFactoryProps<Schema>], SchemaNode>;

/**
 * SchemaNode 생성자 속성 인터페이스입니다.
 * @typeParam Schema - 노드의 JSON Schema 타입
 * @typeParam Value - 노드의 값 타입
 */
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

/**
 * 하위 노드를 가질 수 있는 브랜치 노드의 생성자 속성 인터페이스입니다.
 * @typeParam Schema - 노드의 JSON Schema 타입
 */
export interface BranchNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  nodeFactory: SchemaNodeFactory;
}

/**
 * 가상 노드의 생성자 속성 인터페이스입니다.
 * @typeParam Schema - 노드의 JSON Schema 타입
 */
export interface VirtualNodeConstructorProps<
  Schema extends JsonSchemaWithVirtual,
> extends SchemaNodeConstructorProps<Schema> {
  refNodes?: SchemaNode[];
}

/**
 * 노드 팩토리 함수에 전달되는 속성 타입입니다.
 * @typeParam Schema - 노드의 JSON Schema 타입
 */
export type NodeFactoryProps<Schema extends JsonSchemaWithVirtual> =
  SchemaNodeConstructorProps<Schema> &
    BranchNodeConstructorProps<Schema> &
    VirtualNodeConstructorProps<Schema>;

export type NodeListener = Fn<[event: NodeEvent]>;

export type NodeEvent = {
  type: UnionNodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

export enum NodeEventType {
  /** The node has been activated */
  Activated = BIT_FLAG_00,
  /** The node has been focused */
  Focus = BIT_FLAG_01,
  /** The node has been selected */
  Select = BIT_FLAG_02,
  /** The node has been redrawn */
  Redraw = BIT_FLAG_03,
  /** The node has been refreshed */
  Refresh = BIT_FLAG_04,
  /** The node's path has been updated */
  UpdatePath = BIT_FLAG_05,
  /** The node's value has been updated */
  UpdateValue = BIT_FLAG_06,
  /** The node's state has been updated */
  UpdateState = BIT_FLAG_07,
  /** The node's error has been updated */
  UpdateError = BIT_FLAG_08,
  /** The node's internal error has been updated */
  UpdateOmniError = BIT_FLAG_09,
  /** The node's children have been updated */
  UpdateChildren = BIT_FLAG_10,
  /** The node's computed properties have been updated */
  UpdateComputedProperties = BIT_FLAG_11,
  /** The node's value has been updated */
  RequestEmitChange = BIT_FLAG_12,
  /** The node's validation has been requested */
  RequestValidate = BIT_FLAG_13,
}

export enum PublicNodeEventType {
  /** The node has been focused */
  Focus = NodeEventType.Focus,
  /** The node has been selected */
  Select = NodeEventType.Select,
  /** The node's value has been updated */
  UpdateValue = NodeEventType.UpdateValue,
  /** The node's state has been updated */
  UpdateState = NodeEventType.UpdateState,
  /** The node's error has been updated */
  UpdateError = NodeEventType.UpdateError,
}

export type UnionNodeEventType = NodeEventType | PublicNodeEventType;

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
  [NodeEventType.UpdateOmniError]: JsonSchemaError[];
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.RequestEmitChange]: UnionSetValueOption;
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
  [NodeEventType.UpdateOmniError]: void;
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.RequestEmitChange]: void;
  [NodeEventType.RequestValidate]: void;
};

export enum NodeState {
  /** The node has been modified */
  Dirty = BIT_FLAG_00,
  /** The node has been touched */
  Touched = BIT_FLAG_01,
  /** Show error message */
  ShowError = BIT_FLAG_02,
}

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
  /** SetValue from outside */
  ExternalEvent = BIT_FLAG_02,
  /** Update the value and publish UpdateValue event */
  Propagate = BIT_FLAG_03,
  /** Propagate the update to child nodes */
  Refresh = BIT_FLAG_04,
  /** Trigger a refresh to update the FormTypeInput */
  PublishEvent = BIT_FLAG_05,
  /** Default SetValue option */
  Default = EmitChange | PublishEvent,
  /** Both propagate to children and trigger a refresh */
  Merge = EmitChange | ExternalEvent | Propagate | Refresh | PublishEvent,
  /** Replace the value and propagate the update with refresh */
  Overwrite = Replace | Merge,
}

export enum PublicSetValueOption {
  /** Both propagate to children and trigger a refresh */
  Merge = SetValueOption.Merge,
  /** Replace the value and propagate the update with refresh */
  Overwrite = SetValueOption.Overwrite,
}

export type UnionSetValueOption = SetValueOption | PublicSetValueOption;
