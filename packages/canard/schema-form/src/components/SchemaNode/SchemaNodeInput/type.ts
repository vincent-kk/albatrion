import type { ComponentType } from 'react';

import type { ElementOf } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type { ObjectNodeChildNode } from '@/schema-form/core/nodes/ObjectNode';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface SchemaNodeInputProps {
  node: SchemaNode;
  overrideProps: OverridableFormTypeInputProps;
  PreferredFormTypeInput?: ComponentType<FormTypeInputProps>;
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}

export type ChildComponent = ElementOf<FormTypeInputProps['ChildComponents']>;

export type NodeChildren = Array<
  ObjectNodeChildNode & {
    id?: string;
  }
>;
