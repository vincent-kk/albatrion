import type { ComponentType, ReactElement } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import type { ObjectNodeChildNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';
import type { GridForm } from '../type';

export interface PropsPackage {
  gridFrom?: GridForm;
  readOnly: boolean;
  disabled: boolean;
  watchValues: any[];
  overridableProps?: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
}

export interface SchemaNodeAdapterProps {
  node: SchemaNode;
  gridFrom?: GridForm;
  readOnly: boolean;
  disabled: boolean;
  watchValues: any[];
  overridableProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterRowProps {
  node: SchemaNode;
  readOnly: boolean;
  disabled: boolean;
  watchValues: any[];
  rawChildNodes: RawChildNode[];
  overridableProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterInputProps {
  node: SchemaNode;
  readOnly: boolean;
  disabled: boolean;
  watchValues: any[];
  overridableProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  childNodes: ChildComponent[];
}

export type ChildComponent = ElementOf<FormTypeInputProps['childNodes']>;

export type RawChildNode = {
  element?: ReactElement;
  grid?: number;
  [alt: string]: any;
} & Partial<ObjectNodeChildNode>;
