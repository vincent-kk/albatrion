import { type ReactNode, createElement } from 'react';

import type {
  AllowedValue,
  InferValueType,
  JSONSchema,
} from '@/schema-form/types';

import { FormChildrenRenderer } from './components/FormChildrenRenderer';
import type { FormProps } from './type';

/** Preserve element children or bind function children to the current root. */
export const createChildren = <
  Schema extends JSONSchema,
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
