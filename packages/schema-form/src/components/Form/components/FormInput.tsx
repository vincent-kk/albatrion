import { type ComponentType } from 'react';

import { useMemorize, useSnapshot } from '@lumy-pack/common-react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type {
  FormTypeInputProps,
  FormTypeRendererProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormInputProps = {
  path: string;

  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
} & OverridableFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeInput: InputFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  ...restProps
}: FormInputProps) => {
  const { FormInputRenderer } = useExternalFormContext();
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={
        FormTypeRenderer || FormInputRenderer || FallbackManager.FormInput
      }
      overridableFormTypeInputProps={overrideProps}
    />
  );
};
