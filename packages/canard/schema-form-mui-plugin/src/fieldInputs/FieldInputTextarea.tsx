import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

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
}: FieldInputTextareaProps) => {
  const titleId = useMeaningfulLabelId(fieldTitleId);
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    jsonSchema,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

  const handleChange = useHandle((event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    onChange(text === '' ? undefined : text);
  });

  const finalMinRows = minRows ?? jsonSchema.minRows ?? 3;
  const finalMaxRows = maxRows ?? jsonSchema.maxRows ?? 8;

  return (
    <TextField
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
        htmlInput: { 'aria-labelledby': titleId, 'aria-label': fieldName },
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
