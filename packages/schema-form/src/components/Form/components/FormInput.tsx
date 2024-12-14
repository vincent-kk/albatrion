import type { ComponentType } from 'react';

import { useMemorize, useSnapshot } from '@lumy-pack/common-react';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormInputProps = {
  path: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
} & OverridableFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeInput: InputFormTypeInput,
  ...restProps
}: FormInputProps) => {
  const { FormInputRenderer } = useExternalFormContext();
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormInputRenderer || FallbackManager.FormInput}
      overridableFormTypeInputProps={overrideProps}
    />
  );
};
