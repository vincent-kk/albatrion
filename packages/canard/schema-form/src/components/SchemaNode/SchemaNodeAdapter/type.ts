import type { ComponentType } from 'react';

import type { ElementOf } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type { ObjectNodeChildNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface PropsPackage {
  overridableProps?: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
}

export interface SchemaNodeAdapterProps {
  node: SchemaNode;
  overridableProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterInputProps {
  node: SchemaNode;
  overridableProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  childNodes: ChildComponent[];
}

export type ChildComponent = ElementOf<FormTypeInputProps['childNodes']>;

export type NodeChildren = Array<
  ObjectNodeChildNode & {
    id?: string;
  }
>;
