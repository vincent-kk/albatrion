import type { ReactNode } from 'react';

import { isFunction } from '@winglet/common-utils';

import type { InferSchemaNode, SchemaNode } from '@/schema-form/core';
import type { InferValueType, JsonSchema } from '@/schema-form/types';

import type { FormProps } from './type';

export const createChildren = <
  Schema extends JsonSchema,
  Value = InferValueType<Schema>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
>(
  children: FormProps<Schema, Value>['children'] | undefined,
  jsonSchema: Schema,
  rootNode?: Node,
): ReactNode => {
  if (!children) return null;
  if (isFunction(children)) {
    return children({
      jsonSchema,
      node: rootNode,
      defaultValue: rootNode?.defaultValue as Value,
      value: rootNode?.value as Value,
      errors: rootNode?.errors || undefined,
      isArrayItem: rootNode?.isArrayItem,
    });
  }
  return children;
};
