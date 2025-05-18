import type { Roll } from '@aileron/declare';

import type {
  FormGroupProps as BaseFormGroupProps,
  FormInputProps as BaseFormInputProps,
  FormRenderProps as BaseFormRenderProps,
} from '@/schema-form/components/Form';

type FormGroupProps = Roll<BaseFormGroupProps>;
type FormInputProps = Roll<BaseFormInputProps>;
type FormRenderProps = Roll<BaseFormRenderProps>;

export type { FormGroupProps, FormInputProps, FormRenderProps };
