import type { ComponentType } from 'react';

import { FallbackManager } from '@lumy/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@lumy/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy/schema-form/providers';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@lumy/schema-form/types';

export type FormInputProps = {
  path: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
} & OverridableFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeInput,
  FormTypeRenderer,
  ...overridableFormTypeInputProps
}: FormInputProps) => {
  const { FormInputRenderer } = useExternalFormContext();
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={
        FormTypeRenderer || FormInputRenderer || FallbackManager.FormInput
      }
      overridableFormTypeInputProps={overridableFormTypeInputProps}
    />
  );
};
