import type { ComponentType, ReactElement } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type { ObjectNodeChildNode } from '@lumy/schema-form/core/nodes/ObjectNode';
import type {
  FormTypeInputProps,
  OverrideFormTypeInputProps,
} from '@lumy/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';
import type { GridForm } from '../type';

export interface SchemaNodeAdapterProps {
  node: SchemaNode;
  watchValues: any[];
  gridFrom?: GridForm;
  overridePropsFromProxy: OverrideFormTypeInputProps;
  overridePropsFromInput: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterRowProps {
  node: SchemaNode;
  watchValues: any[];
  rawChildNodes: RawChildNode[];
  overrideFormTypeInputProps: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterInputProps {
  node: SchemaNode;
  watchValues: any[];
  overrideFormTypeInputProps: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  childNodes: ChildComponent[];
}

export type ChildComponent = ElementOf<FormTypeInputProps['childNodes']>;

export type RawChildNode = {
  element?: ReactElement;
  grid?: number;
  [alt: string]: any;
} & Partial<ObjectNodeChildNode>;
