import type { ReactNode } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

interface FieldInputBooleanProps
  extends FieldInputProps<boolean | null, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputBoolean = ({
  inputId,
  labelId,
  getInputId,
  name,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  label: labelProp,
  size: sizeProp,
  hideLabel,
  misfit,
}: FieldInputBooleanProps) => {
  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

  const indeterminate = value !== undefined && typeof value !== 'boolean';

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const captionId = label ? getInputId('legend') : undefined;

  return (
    <FormControlLabel
      label={label && <span id={captionId}>{label}</span>}
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
              'aria-labelledby': captionId ?? labelId,
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
