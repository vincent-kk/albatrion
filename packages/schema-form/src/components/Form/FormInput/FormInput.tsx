import { FallbackFormTypeRenderer } from '@lumy/schema-form/components/FallbackComponents/FallbackFormTypeRenderer';
import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

type FormInputProps = Pick<SchemaNodeProxyProps, 'path' | 'FormTypeRenderer'> &
  OverrideFormTypeInputProps;

export const FormInput = ({
  path,
  FormTypeRenderer,
  ...rest
}: FormInputProps) => {
  return (
    <SchemaNodeProxy
      path={path}
      FormTypeRenderer={FormTypeRenderer || FallbackFormTypeRenderer}
      overrideFormTypeInputProps={rest}
    />
  );
};
