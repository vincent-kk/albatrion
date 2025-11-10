import type { ComponentType } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import { NodeEventType, SetValueOption } from '@/schema-form/core';
import type {
  ChildNodeComponentProps,
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface SchemaNodeInputProps {
  node: SchemaNode;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput: ComponentType<FormTypeInputProps> | null;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

type AdditionalChildNodeProperties = {
  key: string;
  path: string;
  field: string;
};

export type ChildNodeComponent<
  Props extends ChildNodeComponentProps = ChildNodeComponentProps,
> = ComponentType<Props> & AdditionalChildNodeProperties;

/** Default option for node setValue when onChange is triggered in SchemaNodeInput component */
export const HANDLE_CHANGE_OPTION =
  SetValueOption.Replace |
  SetValueOption.Propagate |
  SetValueOption.EmitChange |
  SetValueOption.PublishUpdateEvent;

export const REACTIVE_RERENDERING_EVENTS =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateError |
  NodeEventType.UpdateComputedProperties;
