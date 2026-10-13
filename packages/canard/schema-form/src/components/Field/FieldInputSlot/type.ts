import type { ComponentType, RefObject } from 'react';

import type { FieldNode } from '@/schema-form/core';
import { FieldNodeEventType } from '@/schema-form/core';
import type { FieldInputBindingProps } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ChildFieldProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

import type { FieldProxyProps } from '../FieldProxy';

export interface FieldInputSlotProps {
  node: FieldNode;
  onChangeRef: RefObject<ChildFieldProps['onChange']>;
  onFileAttachRef: RefObject<ChildFieldProps['onFileAttach']>;
  overrideProps: OverridableFieldInputProps;
  PreferredFieldInput: ComponentType<FieldInputBindingProps> | null;
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
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdateError |
  FieldNodeEventType.UpdateControlledProperties |
  FieldNodeEventType.UpdateJsonSchema |
  FieldNodeEventType.UpdatePath;
