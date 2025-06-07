import type { ReactNode } from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { InferSchemaNode } from '@/schema-form/core';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import type { FormProps } from './type';

export const createChildren = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  children: FormProps<Schema, Value>['children'] | undefined,
  jsonSchema: Schema,
  rootNode?: InferSchemaNode<Schema>,
): ReactNode => {
  if (!children) return null;
  if (isFunction(children)) {
    return children({
      jsonSchema,
      node: rootNode,
      defaultValue: rootNode?.defaultValue as Value,
      value: rootNode?.value as Value,
      errors: rootNode?.errors || undefined,
    });
  }
  return children;
};
