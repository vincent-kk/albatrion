import type { ComponentType } from 'react';

import type { Roll } from '@aileron/declare';

import type {
  AllowedValue,
  FieldInputProps,
  OverridableFieldInputProps,
} from '@/schema-form/types';

export type FormInputProps<Value extends AllowedValue> = {
  path?: string;
  /** Skip the registered input frame; changing this remounts the field. */
  unwrapped?: boolean;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
} & OverridableFieldInputProps;

export type RolledFormInputProps<Value extends AllowedValue> = Roll<
  FormInputProps<Value>
>;
