import { type ChangeEvent, type ReactNode, useState } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type NumberJSONSchema = NumberSchema;

interface FieldInputNumberProps
  extends FieldInputPropsWithSchema<
      number | null,
      NumberJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputNumber = ({
  schemaType: type,
  inputId,
  labelId: fieldTitleId,
  name,
  jsonSchema,
  required,
  readOnly,
  disabled,
  value,
  onChange,
  context,
  label: labelProp,
  placeholder,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
  misfit,
  getInputId,
  className,
  style,
}: FieldInputNumberProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

  const [draft, setDraft] = useState<string>();

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (event.target.validity.badInput) {
      setDraft(inputValue);
      return;
    }
    if (inputValue === '') {
      setDraft(undefined);
      onChange(undefined);
      return;
    }
    const numeric = Number(inputValue);
    if (
      !Number.isFinite(numeric) ||
      (type === 'integer' && !Number.isInteger(numeric))
    ) {
      setDraft(inputValue);
      return;
    }
    setDraft(undefined);
    onChange(numeric);
  });

  const labelId = label ? getInputId('legend') : fieldTitleId;
  return (
    <TextField
      className={className}
      style={style}
      id={inputId}
      name={name}
      type="number"
      variant={variant}
      fullWidth={fullWidth}
      label={label}
      required={required}
      size={size}
      placeholder={placeholder}
      value={
        draft ??
        (typeof value === 'number' && Number.isFinite(value) ? value : '')
      }
      onChange={handleChange}
      onBlur={() => setDraft(undefined)}
      disabled={disabled}
      error={misfit}
      slotProps={{
        inputLabel: { id: labelId },
        input: { readOnly },
        htmlInput: {
          'aria-labelledby': labelId,
          min: jsonSchema.minimum,
          max: jsonSchema.maximum,
          step: jsonSchema.multipleOf || (type === 'integer' ? 1 : 'any'),
        },
      }}
    />
  );
};

export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
