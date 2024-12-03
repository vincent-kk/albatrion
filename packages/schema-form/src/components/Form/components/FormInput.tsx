import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
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
  const { FormInputRenderer } = useExternalFormContext();
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeRenderer={
        FormTypeRenderer || FormInputRenderer || FallbackManager.FormInput
      }
      overrideFormTypeInputProps={overrideFormTypeInputProps}
    />
  );
};
