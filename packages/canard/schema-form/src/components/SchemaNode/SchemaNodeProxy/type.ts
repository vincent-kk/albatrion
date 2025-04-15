import type { ComponentType, PropsWithChildren } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  overridableFormTypeInputProps?: OverridableFormTypeInputProps;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
