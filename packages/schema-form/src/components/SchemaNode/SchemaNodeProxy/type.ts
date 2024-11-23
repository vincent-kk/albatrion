import type { ComponentType, PropsWithChildren } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputProps,
  OverrideFormTypeInputProps,
} from '@lumy/schema-form/types';

import type { GridForm, SchemaNodeRenderer } from '../type';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  gridFrom?: GridForm;
  overrideFormTypeInputProps?: OverrideFormTypeInputProps;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  SchemaNodeRenderer?: SchemaNodeRenderer;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
