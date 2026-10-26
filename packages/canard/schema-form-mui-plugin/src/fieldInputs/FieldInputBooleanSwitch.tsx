import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type BooleanSwitchJSONSchema = BooleanSchema & {};

interface FieldInputBooleanSwitchProps
  extends FieldInputPropsWithSchema<
      boolean | null,
      BooleanSwitchJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputBooleanSwitch = ({
  path,
  name,
  required,
  disabled,
  value,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  misfit,
}: FieldInputBooleanSwitchProps) => {
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [context, labelProp, name, sizeProp, hideLabel]);

  return (
    <FormControlLabel
      label={label}
      htmlFor={path}
      required={required}
      disabled={disabled}
      labelPlacement="start"
      control={
        <Switch
          id={path}
          name={name}
          checked={value === true}
          onChange={handleChange}
          disabled={disabled}
          size={size}
          slotProps={{
            input: { role: 'switch', 'aria-invalid': misfit || undefined },
          }}
        />
      }
    />
  );
};

export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  test: ({ type, inputType }) => type === 'boolean' && inputType === 'switch',
} satisfies FieldInputDefinition;
