import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { Dictionary, Fn, Roll } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
  BaseFieldRendererProps,
} from '@/schema-form/types';

export type BaseFormRenderProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
  children: Fn<[props: BaseFieldRendererProps], ReactNode>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & ChildFieldProps;

export type FormRenderProps<Value extends AllowedValue> = Roll<
  BaseFormRenderProps<Value>
>;
