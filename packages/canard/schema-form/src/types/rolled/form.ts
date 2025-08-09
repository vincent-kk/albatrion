import type { Roll } from '@aileron/declare';

import type {
  FormGroupProps as BaseFormGroupProps,
  FormInputProps as BaseFormInputProps,
  FormRenderProps as BaseFormRenderProps,
} from '@/schema-form/components/Form';
import type { AllowedValue } from '@/schema-form/types';

type FormGroupProps<Value extends AllowedValue> = Roll<
  BaseFormGroupProps<Value>
>;
type FormInputProps<Value extends AllowedValue> = Roll<
  BaseFormInputProps<Value>
>;
type FormRenderProps<Value extends AllowedValue> = Roll<
  BaseFormRenderProps<Value>
>;

export type { FormGroupProps, FormInputProps, FormRenderProps };
