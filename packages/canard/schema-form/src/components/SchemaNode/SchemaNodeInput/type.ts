import type { ComponentType, RefObject } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import { SchemaNodeEventType } from '@/schema-form/core';
import type {
  ChildNodeComponentProps,
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxyProps';

export interface SchemaNodeInputProps {
  node: SchemaNode;
  onChangeRef: RefObject<ChildNodeComponentProps['onChange']>;
  onFileAttachRef: RefObject<ChildNodeComponentProps['onFileAttach']>;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput: ComponentType<FormTypeInputProps> | null;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export type AdditionalChildNodeProperties = {
  key: string;
  path: string;
  field: string;
};

export type ChildNodeComponent<
  Props extends ChildNodeComponentProps = ChildNodeComponentProps,
> = ComponentType<Props> & AdditionalChildNodeProperties;

/** Node deliveries that refresh the props of the current input instance. */
export const REACTIVE_RERENDERING_EVENTS =
  SchemaNodeEventType.UpdateValue |
  SchemaNodeEventType.UpdateState |
  SchemaNodeEventType.UpdateError |
  SchemaNodeEventType.UpdateComputedProperties |
  SchemaNodeEventType.UpdateJsonSchema |
  SchemaNodeEventType.UpdatePath;
