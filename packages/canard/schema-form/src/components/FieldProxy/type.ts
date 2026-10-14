import type { ComponentType, PropsWithChildren, RefObject } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type {
  ChildFieldProps,
  FieldInputProps,
  BaseFieldRendererProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

/** Recursive render props shared by the proxy, the input layer, and the deferred-render gate. */
export interface FieldProxyProps {
  path?: string;
  node?: FieldNode;
  onChangeRef?: RefObject<ChildFieldProps['onChange']>;
  onFileAttachRef?: RefObject<ChildFieldProps['onFileAttach']>;
  overridePropsRef?: RefObject<OverridableFieldInputProps>;
  FieldInput?: ComponentType<FieldInputProps>;
  FieldRenderer?: ComponentType<BaseFieldRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
