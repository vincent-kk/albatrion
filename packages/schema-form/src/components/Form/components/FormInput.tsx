import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

export interface FormInputProps extends OverrideFormTypeInputProps {
  path: SchemaNodeProxyProps['path'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
}

export const FormInput = ({
  path,
  FormTypeRenderer,
  ...overrideFormTypeInputProps
}: FormInputProps) => {
  const { FallbackFormInputRenderer } = useExternalFormContext();
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeRenderer={FormTypeRenderer || FallbackFormInputRenderer}
      overrideFormTypeInputProps={overrideFormTypeInputProps}
    />
  );
};
