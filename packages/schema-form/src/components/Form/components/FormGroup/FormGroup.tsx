import {
  SchemaNodeProxy,
  type SchemaNodeProxyProps,
} from '@lumy/schema-form/components/SchemaNode/SchemaNodeProxy';
import type { OverrideFormTypeInputProps } from '@lumy/schema-form/types';

interface FormGroupProps extends OverrideFormTypeInputProps {
  path: SchemaNodeProxyProps['path'];
  gridFrom?: SchemaNodeProxyProps['gridFrom'];
  FormTypeInput?: SchemaNodeProxyProps['FormTypeInput'];
  FormTypeRenderer?: SchemaNodeProxyProps['FormTypeRenderer'];
  Wrapper?: SchemaNodeProxyProps['Wrapper'];
}

export const FormGroup = ({
  path,
  gridFrom,
  FormTypeInput,
  FormTypeRenderer,
  Wrapper,
  ...overrideFormTypeInputProps
}: FormGroupProps) => (
  <SchemaNodeProxy
    path={path}
    gridFrom={gridFrom}
    FormTypeInput={FormTypeInput}
    FormTypeRenderer={FormTypeRenderer}
    Wrapper={Wrapper}
    overrideFormTypeInputProps={overrideFormTypeInputProps}
  />
);
