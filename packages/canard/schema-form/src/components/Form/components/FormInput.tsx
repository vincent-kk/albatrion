import type { ComponentType } from 'react';

import { JSONPath } from '@winglet/json';
import { useMemorize, useSnapshot } from '@winglet/react-utils';

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
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path ?? JSONPath.Root}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormInputRenderer || PluginManager.FormInput}
      overrideProps={overrideProps}
    />
  );
};
