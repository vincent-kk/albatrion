import type { ComponentType } from 'react';

import { useConstant, useSnapshot } from '@winglet/react-utils/hook';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type {
  FormTypeInputProps,
  OverridableFormTypeInputProps,
} from '@/schema-form/types';

export type FormInputProps = {
  path?: string;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
} & OverridableFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeInput: InputFormTypeInput,
  ...restProps
}: FormInputProps) => {
  const { FormInputRenderer } = useExternalFormContext();
  const overrideProps = useSnapshot(restProps);
  const FormTypeInput = useConstant(InputFormTypeInput);
  return (
    <SchemaNodeProxy
      path={path}
      overrideProps={overrideProps}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormInputRenderer || PluginManager.FormInput}
    />
  );
};
