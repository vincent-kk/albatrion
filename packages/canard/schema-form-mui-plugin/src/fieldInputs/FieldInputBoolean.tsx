import { type ReactNode, useMemo } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

interface FieldInputBooleanProps
  extends FieldInputProps<boolean | null, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputBoolean = ({
  inputId,
  labelId: fieldTitleId,
  name,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  jsonSchema,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  misfit,
}: FieldInputBooleanProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
    ];
  }, [context, jsonSchema, labelProp, name, sizeProp, hideLabel]);

  const indeterminate = value !== undefined && typeof value !== 'boolean';

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  return (
    <FormControlLabel
      label={label}
      htmlFor={inputId}
      required={required}
      disabled={disabled || readOnly}
      control={
        <Checkbox
          id={inputId}
          name={name}
          disabled={disabled || readOnly}
          indeterminate={indeterminate}
          checked={value === true}
          onChange={handleChange}
          size={size}
          slotProps={{
            input: {
              'aria-labelledby': fieldTitleId,
              'aria-label': fieldName,
              'aria-invalid': misfit || undefined,
            },
          }}
        />
      }
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  controlled: true,
  test: ({ type }) => type === 'boolean',
} satisfies FieldInputDefinition;
