import type { ChangeEvent, ReactNode } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type TextareaJSONSchema = StringSchema & {
  format?: 'textarea';
  minRows?: number;
  maxRows?: number;
};

interface FieldInputTextareaProps
  extends FieldInputPropsWithSchema<
      string | null,
      TextareaJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  minRows?: number;
  maxRows?: number;
  hideLabel?: boolean;
}

const FieldInputTextarea = ({
  inputId,
  labelId: fieldTitleId,
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
  misfit,
  getInputId,
  className,
  style,
}: FieldInputTextareaProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

  const handleChange = useHandle((event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    onChange(text === '' ? undefined : text);
  });

  const finalMinRows = minRows ?? jsonSchema.minRows ?? 3;
  const finalMaxRows = maxRows ?? jsonSchema.maxRows ?? 8;

  const labelId = label ? getInputId('legend') : fieldTitleId;
  return (
    <TextField
      className={className}
      style={style}
      id={inputId}
      name={name}
      multiline
      variant={variant}
      fullWidth={fullWidth}
      label={label}
      required={required}
      size={size}
      placeholder={placeholder}
      defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
      onChange={handleChange}
      disabled={disabled}
      error={misfit}
      minRows={finalMinRows}
      maxRows={finalMaxRows}
      slotProps={{
        inputLabel: { id: labelId },
        htmlInput: { 'aria-labelledby': labelId },
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

export const FieldInputTextareaDefinition = {
  Component: FieldInputTextarea,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'textarea' || inputType === 'textarea'),
} satisfies FieldInputDefinition;
