import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface TextareaJsonSchema extends StringSchema {
  format?: 'textarea';
  formType?: 'textarea';
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

interface FormTypeInputTextareaProps
  extends FormTypeInputPropsWithSchema<string, TextareaJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  minRows?: number;
  maxRows?: number;
}

const FormTypeInputTextarea = ({
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
  minRows,
  maxRows,
}: FormTypeInputTextareaProps) => {
  const [label, size] = useMemo(() => {
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
    ];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

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
      label={label}
      required={required}
      size={size}
      placeholder={jsonSchema.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={disabled}
      minRows={finalMinRows}
      maxRows={finalMaxRows}
      slotProps={{
        input: {
          readOnly,
        },
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
