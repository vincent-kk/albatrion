import { useContext } from 'react';

import type { SchemaNodeProxyProps } from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import { FormTypeRendererContext } from '@lumy/schema-form/providers';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

import { FormInput } from '../FormInput';

type FormGroupProps = Omit<SchemaNodeProxyProps, 'FormTypeRenderer'> &
  OverrideFormTypeInputProps;

export const FormGroup = ({ path, ...rest }: FormGroupProps) => {
  const { FormTypeRenderer } = useContext(FormTypeRendererContext);
  return (
    <FormInput path={path} {...rest} FormTypeRenderer={FormTypeRenderer} />
  );
};
