import { FallbackSchemaNodeRenderer } from '@lumy/schema-form/components/FallbackComponents/FallbackSchemaNodeRenderer';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

type FormInputProps = Pick<
  SchemaNodeProxyProps,
  'path' | 'SchemaNodeRenderer'
> &
  OverrideFormTypeInputProps;

export const FormInput = ({
  path,
  SchemaNodeRenderer,
  ...rest
}: FormInputProps) => {
  return (
    <SchemaNodeProxy
      path={path}
      SchemaNodeRenderer={SchemaNodeRenderer || FallbackSchemaNodeRenderer}
      overrideFormTypeInputProps={rest}
    />
  );
};
