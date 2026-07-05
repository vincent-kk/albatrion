import { type ReactNode, createElement } from 'react';

import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import { FormChildrenRenderer } from './components/FormChildrenRenderer';
import type { FormProps } from './type';

export const createChildren = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  children: FormProps<Schema, Value>['children'] | undefined,
  jsonSchema: Schema,
): ReactNode => {
  if (children == null) return null;
  if (typeof children !== 'function') return children;
  return createElement(FormChildrenRenderer<Schema, Value>, {
    jsonSchema,
    render: children,
  });
};
