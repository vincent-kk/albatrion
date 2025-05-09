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

/**
 * 유효성 검증 모드를 정의합니다.
 */
export enum ValidationMode {
  None = BIT_MASK_NONE,
  OnChange = BIT_FLAG_01,
  OnRequest = BIT_FLAG_02,
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

/**
 * 노드 이벤트 리스너 함수 타입입니다.
 */
export type NodeListener = Fn<[event: NodeEvent]>;

/**
 * 노드에서 발생하는 이벤트의 구조입니다.
 */
export type NodeEvent = {
  type: UnionNodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

/**
 * 노드 이벤트 타입을 정의합니다.
 */
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

/**
 * 외부에 노출되는 노드 이벤트 타입을 정의합니다.
 */
export enum PublicNodeEventType {
  Focus = NodeEventType.Focus,
  Select = NodeEventType.Select,
  UpdateValue = NodeEventType.UpdateValue,
  UpdateState = NodeEventType.UpdateState,
  UpdateError = NodeEventType.UpdateError,
}

/**
 * 내부 및 외부 노드 이벤트 타입을 합치는 유니언 타입입니다.
 */
export type UnionNodeEventType = NodeEventType | PublicNodeEventType;

/**
 * 노드 이벤트의 페이로드 타입을 정의합니다.
 */
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

/**
 * 노드 이벤트의 옵션 타입을 정의합니다.
 */
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

/**
 * 노드의 상태를 정의하는 열거형입니다.
 */
export enum NodeState {
  Dirty = BIT_FLAG_01,
  Touched = BIT_FLAG_02,
  ShowError = BIT_FLAG_03,
}

/**
 * 노드 상태 플래그를 정의하는 타입입니다.
 */
export type NodeStateFlags = {
  [NodeState.Dirty]?: boolean;
  [NodeState.Touched]?: boolean;
  [NodeState.ShowError]?: boolean;
  [key: string]: any;
};

/**
 * 값 설정 옵션을 정의하는 열거형입니다.
 */
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

/**
 * 외부에 노출되는 값 설정 옵션을 정의하는 열거형입니다.
 */
export enum PublicSetValueOption {
  Merge = SetValueOption.Merge,
  Overwrite = SetValueOption.Overwrite,
}

/**
 * 내부 및 외부 값 설정 옵션을 합치는 유니언 타입입니다.
 */
export type UnionSetValueOption = SetValueOption | PublicSetValueOption;
