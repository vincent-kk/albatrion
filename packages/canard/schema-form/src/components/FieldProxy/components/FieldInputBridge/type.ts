import type { ComponentType, RefObject } from 'react';

import type { Nullable } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { FieldNodeEventType } from '@/schema-form/core';
import type { FieldInputBindingProps } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildFieldProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

import type { FieldProxyProps } from '../../type';

export interface FieldInputBridgeProps {
  node: FieldNode;
  /** Direct bound-input flag; override payloads retain their own key. */
  unwrapped?: boolean;
  /** Change callback passed directly to this input, preferred over its parent's callback. */
  onChangeRef: RefObject<ChildFieldProps['onChange']>;
  /** Attachment callback passed directly to this input, preferred over its parent's callback. */
  onFileAttachRef: RefObject<ChildFieldProps['onFileAttach']>;
  /** Parent change callback read at invocation when the direct onChangeRef callback is absent. */
  overrideOnChangeRef?: RefObject<ChildFieldProps['onChange']>;
  /** Parent attachment callback read at invocation when the direct onFileAttachRef callback is absent. */
  overrideOnFileAttachRef?: RefObject<ChildFieldProps['onFileAttach']>;
  overrideProps: OverridableFieldInputProps;
  PreferredFieldInput: Nullable<ComponentType<FieldInputBindingProps>>;
  NodeProxy: ComponentType<FieldProxyProps>;
}

export type AdditionalChildNodeProperties = {
  key: string;
  path: string;
  field: string;
};

export type ChildField<Props extends ChildFieldProps = ChildFieldProps> =
  ComponentType<Props> & AdditionalChildNodeProperties;

/** Node deliveries that refresh the props of the current input instance. */
export const REACTIVE_RERENDERING_EVENTS =
  FieldNodeEventType.UpdateValue |
  FieldNodeEventType.UpdateControlledProperties |
  FieldNodeEventType.UpdateJsonSchema |
  FieldNodeEventType.UpdatePath;
