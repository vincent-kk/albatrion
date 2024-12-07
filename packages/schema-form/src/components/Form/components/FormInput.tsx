import type { ComponentType } from 'react';

import { FallbackManager } from '@lumy-form/app/FallbackManager';
import { SchemaNodeProxy } from '@lumy-form/components/SchemaNode';
import { useExternalFormContext } from '@lumy-form/providers';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@lumy-form/types';

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
