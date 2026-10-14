import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import type { Dictionary, Fn } from '@aileron/declare';

import type {
  AllowedValue,
  ChildFieldProps,
  FieldInputProps,
  FieldRendererProps,
} from '@/schema-form/types';

export type FormRenderProps<Value extends AllowedValue> = {
  path?: string;
  FieldInput?: ComponentType<FieldInputProps<Value>>;
  children: Fn<[props: FieldRendererProps], ReactNode>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
} & ChildFieldProps;
