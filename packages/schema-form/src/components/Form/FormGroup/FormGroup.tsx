import { useContext } from 'react';

import type { SchemaNodeProxyProps } from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import { SchemaNodeRendererContext } from '@lumy/schema-form/providers';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

import { FormInput } from '../FormInput';

type FormGroupProps = Omit<SchemaNodeProxyProps, 'SchemaNodeRenderer'> &
  OverrideFormTypeInputProps;

export const FormGroup = ({ path, ...rest }: FormGroupProps) => {
  const { SchemaNodeRenderer } = useContext(SchemaNodeRendererContext);
  return (
    <FormInput path={path} {...rest} SchemaNodeRenderer={SchemaNodeRenderer} />
  );
};
