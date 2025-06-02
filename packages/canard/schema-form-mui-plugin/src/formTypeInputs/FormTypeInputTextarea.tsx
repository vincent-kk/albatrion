import { type ChangeEvent } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface TextareaJsonSchema extends StringSchema {
  format?: 'textarea';
  formType?: 'textarea';
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

interface FormTypeInputTextareaProps
  extends FormTypeInputPropsWithSchema<
    string,
    TextareaJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  minRows?: number;
  maxRows?: number;
}

const FormTypeInputTextarea = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  onChange,
  context,
  size,
  minRows,
  maxRows,
}: FormTypeInputTextareaProps) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  });

  const finalMinRows = minRows ?? jsonSchema.minRows ?? 3;
  const finalMaxRows = maxRows ?? jsonSchema.maxRows ?? 8;

  return (
    <TextField
      id={path}
      name={name}
      multiline
      variant="outlined"
      fullWidth
      size={size || context?.size || 'medium'}
      placeholder={jsonSchema.placeholder}
      value={value ?? ''}
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={disabled}
      minRows={finalMinRows}
      maxRows={finalMaxRows}
      InputProps={{
        readOnly,
      }}
      sx={{
        '& .MuiInputBase-root': {
          alignItems: 'flex-start',
        },
      }}
    />
  );
};

export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'textarea' || formType === 'textarea'),
} satisfies FormTypeInputDefinition;
