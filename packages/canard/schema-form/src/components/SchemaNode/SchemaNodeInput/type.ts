import type { ComponentType } from 'react';

import type { ElementOf } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import { NodeEventType, SetValueOption } from '@/schema-form/core';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface SchemaNodeInputProps {
  node: SchemaNode;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export type ChildNodeComponent = ElementOf<
  FormTypeInputProps['ChildNodeComponents']
>;

/** Default option for node setValue when onChange is triggered in SchemaNodeInput component */
export const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

export const PREEMPTIVE_RERENDERING_EVENTS =
  NodeEventType.UpdateError | NodeEventType.UpdateComputedProperties;

export const REACTIVE_RERENDERING_EVENTS =
  NodeEventType.UpdateValue | PREEMPTIVE_RERENDERING_EVENTS;
