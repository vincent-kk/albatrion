import type { ComponentType } from 'react';

import type { ElementOf } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type { ObjectNodeChildNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface SchemaNodeAdapterProps {
  node: SchemaNode;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export interface SchemaNodeAdapterInputProps {
  node: SchemaNode;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export type ChildComponent = ElementOf<FormTypeInputProps['ChildNodes']>;

export type NodeChildren = Array<
  ObjectNodeChildNode & {
    id?: string;
  }
>;
