import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface StringJsonSchema extends StringSchema {
  format?: 'password';
  formType?: 'password';
  placeholder?: string;
}

interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, StringJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FormTypeInputString = ({
  path,
  name,
  jsonSchema,
  required,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
}: FormTypeInputStringProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp, hideLabel]);

  const isPassword = useMemo(() => {
    return (
      jsonSchema.format === 'password' || jsonSchema.formType === 'password'
    );
  }, [jsonSchema]);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <TextField
      id={path}
      name={name}
      type={isPassword ? 'password' : 'text'}
      variant="outlined"
      fullWidth
      placeholder={jsonSchema.placeholder}
      label={label}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      size={size}
      slotProps={{
        input: {
          readOnly,
        },
      }}
    />
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: {
    type: 'string',
  },
} satisfies FormTypeInputDefinition;
