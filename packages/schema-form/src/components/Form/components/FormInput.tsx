import { FormInputRenderer } from '@lumy/schema-form/components/FallbackComponents';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

export interface FormInputProps extends OverrideFormTypeInputProps {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormInput = ({
  path,
  FormTypeRenderer = FormInputRenderer,
  ...overrideFormTypeInputProps
}: FormInputProps) => (
  <SchemaNodeProxy
    path={path}
    FormTypeRenderer={FormTypeRenderer}
    overrideFormTypeInputProps={overrideFormTypeInputProps}
  />
);
