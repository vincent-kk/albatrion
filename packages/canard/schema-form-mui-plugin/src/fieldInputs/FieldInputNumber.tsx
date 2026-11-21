import {
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

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
  defaultValue,
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
}: FieldInputNumberProps) => {
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

  const draftRef = useRef<string | null>(null);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (event.target.validity.badInput) {
      draftRef.current = inputValue;
      return;
    }
    if (inputValue === '') {
      draftRef.current = null;
      onChange(undefined);
      return;
    }
    const numeric = Number(inputValue);
    if (
      !Number.isFinite(numeric) ||
      (type === 'integer' && !Number.isInteger(numeric))
    ) {
      draftRef.current = inputValue;
      return;
    }
    draftRef.current = null;
    onChange(numeric);
  });

  const handleBlur = useHandle((event: FocusEvent<HTMLInputElement>) => {
    if (draftRef.current === null && !event.target.validity.badInput) return;
    event.target.value = typeof value === 'number' ? '' + value : '';
    draftRef.current = null;
  });

  return (
    <TextField
      id={inputId}
      name={name}
      type="number"
      variant={variant}
      fullWidth={fullWidth}
      label={label}
      required={required}
      size={size}
      placeholder={placeholder}
      defaultValue={
        typeof defaultValue === 'number' && Number.isFinite(defaultValue)
          ? defaultValue
          : undefined
      }
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      error={misfit}
      slotProps={{
        input: {
          readOnly,
          inputProps: {
            'aria-labelledby': titleId,
            'aria-label': fieldName,
            min: jsonSchema.minimum,
            max: jsonSchema.maximum,
            step: jsonSchema.multipleOf || (type === 'integer' ? 1 : 'any'),
          },
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
