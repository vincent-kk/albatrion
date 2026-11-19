import { type ReactNode, useMemo } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface FieldInputBooleanProps
  extends FieldInputProps<boolean | null, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputBoolean = ({
  id,
  name,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  misfit,
}: FieldInputBooleanProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [context, labelProp, name, sizeProp, hideLabel]);

  const indeterminate = value !== undefined && typeof value !== 'boolean';

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  return (
    <FormControlLabel
      label={label}
      htmlFor={id}
      required={required}
      disabled={disabled || readOnly}
      control={
        <Checkbox
          id={id}
          name={name}
          disabled={disabled || readOnly}
          indeterminate={indeterminate}
          checked={value === true}
          onChange={handleChange}
          size={size}
          slotProps={{ input: { 'aria-invalid': misfit || undefined } }}
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
