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

/** SchemaNodeInput 컴포넌트에서 onChange를 할때, node setValue default option */
export const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

/** SchemaNodeInput 컴포넌트에서 rerendering을 유발하는 node event type */
export const RERENDERING_EVENT =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;
