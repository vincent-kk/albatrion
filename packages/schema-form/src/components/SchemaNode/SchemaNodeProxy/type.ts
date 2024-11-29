import type { ComponentType, PropsWithChildren } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverrideFormTypeInputProps,
} from '@lumy/schema-form/types';

import type { GridForm } from '../type';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  gridFrom?: GridForm;
  overrideFormTypeInputProps?: OverrideFormTypeInputProps;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
