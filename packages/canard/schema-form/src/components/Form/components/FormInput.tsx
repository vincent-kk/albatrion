import type { CSSProperties, ComponentType } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/types';

import { FallbackManager } from '@/schema-form/app/FallbackManager';
import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import { useExternalFormContext } from '@/schema-form/providers';
import type { FormTypeInputProps } from '@/schema-form/types';

export type FormInputProps = {
  path: string;
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
      path={path}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormInputRenderer || FallbackManager.FormInput}
      overridableFormTypeInputProps={overrideProps}
    />
  );
};
