import { type ChangeEvent, useMemo } from 'react';

import { FormControlLabel, TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  format?: 'password';
  formType?: 'password';
  placeholder?: string;
}

interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
}

const FormTypeInputString = ({
  path,
  name,
  label,
  required,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputStringProps) => {
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
      label={label || name}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      size={size || context?.size}
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
