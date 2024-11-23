import type { ComponentType, PropsWithChildren } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type { SchemaFormAdapterProps } from '@lumy/schema-form/types';

import type { GridForm, SchemaNodeRenderer } from '../type';

export interface SchemaNodeProxyProps {
  path?: string;
  node?: SchemaNode;
  gridFrom?: GridForm;
  schemaFormAdapterProps?: SchemaFormAdapterProps;
  SchemaNodeRenderer?: SchemaNodeRenderer;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
}
