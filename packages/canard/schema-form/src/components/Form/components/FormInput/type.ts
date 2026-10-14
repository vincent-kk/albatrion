import type { ComponentType } from 'react';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
} from '@/schema-form/types';

export type FormInputProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
} & ChildFieldProps;
