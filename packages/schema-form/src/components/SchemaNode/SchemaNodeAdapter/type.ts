import { ComponentType } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type {
  FormTypeInputProps,
  OverrideFormTypeInputProps,
} from '@lumy/schema-form/types';

import type { GridForm } from '../type';

export interface SchemaNodeAdapterProps {
  node: SchemaNode;
  watchValues: any[];
  gridFrom?: GridForm;
  overridePropsFromProxy: OverrideFormTypeInputProps;
  overridePropsFromInput: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
}

export interface SchemaNodeAdapterRowProps {
  node: SchemaNode;
}
