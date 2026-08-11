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
  BIT_FLAG_15,
  BIT_FLAG_16,
} from '@/schema-form/app/constants';
import type { JsonSchemaError } from '@/schema-form/types';

import type { NodeStateFlags } from './state';
import type { UnionSetValueOption } from './value';

/** Callback signature invoked when a `NodeEvent` is published by a node. */
export type NodeListener = Fn<[event: NodeEventCollection]>;

/** A single event entry: its type plus optional payload and options. */
export type NodeEventEntity<Type extends NodeEventType = NodeEventType> = [
  type: Type,
  payload?: NodeEventPayload[Type],
  options?: NodeEventOptions[Type],
];

/** Batched event delivered to listeners, with merged payload and options. */
export type NodeEventCollection = {
  type: UnionNodeEventType;
  payload?: Partial<NodeEventPayload>;
  options?: Partial<NodeEventOptions>;
};

/** Every event a node can publish, as bit flags. */
export enum NodeEventType {
  /** Node becomes the initialized target within the form graph. */
  Initialized = BIT_FLAG_00,
  /** Node's absolute path within the form graph has changed. */
  UpdatePath = BIT_FLAG_01,
  /** Node's value has changed. */
  UpdateValue = BIT_FLAG_02,
  /** Node's UI state flags have changed. */
  UpdateState = BIT_FLAG_03,
  /** Node's global state flags have changed. */
  UpdateGlobalState = BIT_FLAG_04,
  /** Node's validation errors have changed. */
  UpdateError = BIT_FLAG_05,
  /** Node's global/aggregate errors have changed. */
  UpdateGlobalError = BIT_FLAG_06,
  /** Children collection has changed (add/remove/reorder). */
  UpdateChildren = BIT_FLAG_07,
  /** Derived/computed properties have changed. */
  UpdateComputedProperties = BIT_FLAG_08,
  /** `Input` component associated with the node receives focus. */
  Focused = BIT_FLAG_09,
  /** `Input` component loses focus. */
  Blurred = BIT_FLAG_10,
  /** Request the `Input` component to receive focus. */
  RequestFocus = BIT_FLAG_11,
  /** Request selection on the `Input` component. */
  RequestSelect = BIT_FLAG_12,
  /** Request a refresh of the `Input` component. */
  RequestRefresh = BIT_FLAG_13,
  /** Request a remount of the `Renderer` component. */
  RequestRemount = BIT_FLAG_14,
  /** Request to emit a value change with a specific strategy. */
  RequestEmitChange = BIT_FLAG_15,
  /** Request to inject the node's value to a handler. */
  RequestInjection = BIT_FLAG_16,
}

/** Subset of `NodeEventType` exposed to consumers of the package. */
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
  /** Public request to remount the `Renderer` component. */
  RequestRemount = NodeEventType.RequestRemount,
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
  [NodeEventType.UpdateGlobalState]: NodeStateFlags;
  [NodeEventType.UpdateError]: JsonSchemaError[];
  [NodeEventType.UpdateGlobalError]: JsonSchemaError[];
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.Focused]: void;
  [NodeEventType.Blurred]: void;
  [NodeEventType.RequestFocus]: void;
  [NodeEventType.RequestSelect]: void;
  [NodeEventType.RequestRefresh]: void;
  [NodeEventType.RequestRemount]: void;
  [NodeEventType.RequestEmitChange]: UnionSetValueOption;
  [NodeEventType.RequestInjection]: void;
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
    inject?: boolean;
  };
  [NodeEventType.UpdateState]: void;
  [NodeEventType.UpdateGlobalState]: void;
  [NodeEventType.UpdateError]: void;
  [NodeEventType.UpdateGlobalError]: void;
  [NodeEventType.UpdateChildren]: void;
  [NodeEventType.UpdateComputedProperties]: void;
  [NodeEventType.Focused]: void;
  [NodeEventType.Blurred]: void;
  [NodeEventType.RequestFocus]: void;
  [NodeEventType.RequestSelect]: void;
  [NodeEventType.RequestRefresh]: void;
  [NodeEventType.RequestRemount]: void;
  [NodeEventType.RequestEmitChange]: boolean;
  [NodeEventType.RequestInjection]: void;
};
