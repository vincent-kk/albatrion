import type { ComponentType, PropsWithChildren } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputProps,
  OverrideFormTypeInputProps,
} from '@lumy/schema-form/types';

import type { FormTypeRenderer, GridForm } from '../type';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  gridFrom?: GridForm;
  overrideFormTypeInputProps?: OverrideFormTypeInputProps;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: FormTypeRenderer;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
