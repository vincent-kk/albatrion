import type { CSSProperties, ComponentType, PropsWithChildren } from 'react';

import { useMemorize, useSnapshot } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/types';

import { SchemaNodeProxy } from '@/schema-form/components/SchemaNode';
import {
  type FormTypeInputProps,
  type FormTypeRendererProps,
  JSONPath,
} from '@/schema-form/types';

export type FormGroupProps = {
  path?: string;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  FormTypeInput?: ComponentType<FormTypeInputProps>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  Wrapper?: ComponentType<PropsWithChildren<Dictionary>>;
  style?: CSSProperties;
  className?: string;
  context?: Dictionary;
};

export const FormGroup = ({
  path,
  FormTypeInput: InputFormTypeInput,
  FormTypeRenderer: InputFormTypeRenderer,
  Wrapper: InputWrapper,
  ...restProps
}: FormGroupProps) => {
  const FormTypeInput = useMemorize(InputFormTypeInput);
  const FormTypeRenderer = useMemorize(InputFormTypeRenderer);
  const Wrapper = useMemorize(InputWrapper);
  const overrideProps = useSnapshot(restProps);
  return (
    <SchemaNodeProxy
      path={path ?? JSONPath.Root}
      FormTypeInput={FormTypeInput}
      FormTypeRenderer={FormTypeRenderer}
      overridableFormTypeInputProps={overrideProps}
      Wrapper={Wrapper}
    />
  );
};
