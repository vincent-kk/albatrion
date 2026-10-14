import type { Roll } from '@aileron/declare';

import type {
  FormFieldProps as BaseFormFieldProps,
  FormInputProps as BaseFormInputProps,
  FormRenderProps as BaseFormRenderProps,
} from '@/schema-form/components/Form';
import type { AllowedValue } from '@/schema-form/types';

type FormFieldProps<Value extends AllowedValue> = Roll<
  BaseFormFieldProps<Value>
>;
type FormInputProps<Value extends AllowedValue> = Roll<
  BaseFormInputProps<Value>
>;
type FormRenderProps<Value extends AllowedValue> = Roll<
  BaseFormRenderProps<Value>
>;

export type { FormFieldProps, FormInputProps, FormRenderProps };
