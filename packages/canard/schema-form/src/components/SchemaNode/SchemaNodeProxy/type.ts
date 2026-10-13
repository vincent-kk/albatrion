import type { ComponentType, PropsWithChildren, RefObject } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type {
  ChildNodeComponentProps,
  FieldInputProps,
  FieldRendererProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

/** Recursive render props shared by the proxy, the input layer, and the deferred-render gate. */
export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  onChangeRef?: RefObject<ChildNodeComponentProps['onChange']>;
  onFileAttachRef?: RefObject<ChildNodeComponentProps['onFileAttach']>;
  overridePropsRef?: RefObject<OverridableFieldInputProps>;
  FieldInput?: ComponentType<FieldInputProps>;
  FieldRenderer?: ComponentType<FieldRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
