import type { ComponentType, ReactElement } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';
import type { ObjectNodeChildNode } from '@lumy/schema-form/core/schemaNodes/ObjectNode';
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

export interface SchemaNodeRowProps {
  node: SchemaNode;
  watchValues: any[];
  overrideFormTypeInputProps: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  rawChildNodes: RawChildNode[];
}

export interface SchemaNodeInputProps {
  node: SchemaNode;
  watchValues: any[];
  overrideFormTypeInputProps: OverrideFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  childNodes: ChildComponent[];
}

export type ChildComponent = ElementOf<FormTypeInputProps['childNodes']>;

export type RawChildNode = {
  node?: SchemaNode;
  element?: ReactElement;
  grid?: number;
  [alt: string]: any;
} & ObjectNodeChildNode;
