import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type TextareaJsonSchema = StringSchema & {
  format?: 'textarea';
  formType?: 'textarea';
  minRows?: number;
  maxRows?: number;
};

interface FormTypeInputTextareaProps
  extends FormTypeInputPropsWithSchema<
      string | null,
      TextareaJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  minRows?: number;
  maxRows?: number;
  hideLabel?: boolean;
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
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  minRows,
  maxRows,
  hideLabel,
}: FormTypeInputTextareaProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

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
      variant={variant}
      fullWidth={fullWidth}
      label={label}
      required={required}
      size={size}
      placeholder={placeholder}
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
