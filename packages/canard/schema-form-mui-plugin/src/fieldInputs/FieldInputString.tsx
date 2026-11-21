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

type StringJSONSchema = StringSchema & {
  format?: 'password';
};

interface FieldInputStringProps
  extends FieldInputPropsWithSchema<
      string | null,
      StringJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputString = ({
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
  hideLabel,
  misfit,
}: FieldInputStringProps) => {
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

  const isPassword = useMemo(() => {
    return (
      jsonSchema.format === 'password' ||
      jsonSchema.presentation?.inputType === 'password'
    );
  }, [jsonSchema]);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    onChange(text === '' ? undefined : text);
  });

  return (
    <TextField
      id={inputId}
      name={name}
      type={isPassword ? 'password' : 'text'}
      variant={variant}
      fullWidth={fullWidth}
      placeholder={placeholder}
      label={label}
      required={required}
      disabled={disabled}
      error={misfit}
      defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
      onChange={handleChange}
      size={size}
      slotProps={{
        htmlInput: { 'aria-labelledby': titleId, 'aria-label': fieldName },
        input: {
          readOnly,
        },
      }}
    />
  );
};

export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: {
    type: 'string',
  },
} satisfies FieldInputDefinition;
