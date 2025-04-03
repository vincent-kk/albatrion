import type { CSSProperties, ComponentType } from 'react';

import { JSONPath } from '@winglet/json-schema';
import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/types';

import { PluginManager } from '@/schema-form/app/plugin';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type { FormTypeInputProps } from '@/schema-form/types';

export type FormInputProps = {
  path?: string;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  style?: CSSProperties;
  className?: string;
  context?: Dictionary;
};

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
      overridableFormTypeInputProps={overrideProps}
    />
  );
};
