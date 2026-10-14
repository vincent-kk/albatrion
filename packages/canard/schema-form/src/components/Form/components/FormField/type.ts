import type { ComponentType, PropsWithChildren } from 'react';

import type { Dictionary } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
  FieldRendererProps,
} from '@/schema-form/types';

export type FormFieldProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
  FieldRenderer?: ComponentType<FieldRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & ChildFieldProps;
