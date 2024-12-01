import type { ReactNode } from 'react';

import { isFunction } from '@lumy-pack/common';

import type { InferSchemaNode, SchemaNode } from '@lumy/schema-form/core';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@lumy/schema-form/types';

import type { FormProps } from './type';

export const createChildren = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
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
