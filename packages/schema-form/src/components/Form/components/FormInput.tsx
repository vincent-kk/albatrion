import type { ComponentType } from 'react';

import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';
import type {
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@lumy/schema-form/types';

export type FormInputProps = {
  path: string;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
} & OverridableFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeRenderer,
  ...overridableFormTypeInputProps
}: FormInputProps) => {
  const { FormInputRenderer } = useExternalFormContext();
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeRenderer={
        FormTypeRenderer || FormInputRenderer || FallbackManager.FormInput
      }
      overridableFormTypeInputProps={overridableFormTypeInputProps}
    />
  );
};
