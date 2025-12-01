import type { ComponentType, PropsWithChildren, RefObject } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type {
  ChildNodeComponentProps,
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  onChangeRef?: RefObject<ChildNodeComponentProps['onChange']>;
  onFileAttachRef?: RefObject<ChildNodeComponentProps['onFileAttach']>;
  overridePropsRef?: RefObject<OverridableFormTypeInputProps>;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
