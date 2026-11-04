import { type ReactNode, createElement } from 'react';

import type { Optional } from '@aileron/declare';

import type {
  AllowedValue,
  InferValueType,
  JSONSchema,
} from '@/schema-form/types';

import { FormChildrenRenderer } from '../components/FormChildrenRenderer';
import type { FormProps } from '../types/props';

/** Preserve element children or bind function children to the current root. */
export const createChildren = <
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>(
  children: Optional<FormProps<Schema, Value>['children']>,
  jsonSchema: Schema,
): ReactNode => {
  if (children == null) return null;
  if (typeof children !== 'function') return children;
  return createElement(FormChildrenRenderer<Schema, Value>, {
    jsonSchema,
    render: children,
  });
};
