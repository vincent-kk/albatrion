import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

import { MuiContext } from '../type';

interface BooleanSwitchJsonSchema
  extends BooleanSchema<{
    size?: 'small' | 'medium';
  }> {
  formType: 'switch';
}

interface FormTypeInputBooleanSwitchProps
  extends FormTypeInputPropsWithSchema<
      boolean,
      BooleanSwitchJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
}

const FormTypeInputBooleanSwitch = ({
  path,
  name,
  required,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
}: FormTypeInputBooleanSwitchProps) => {
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const [label, size] = useMemo(() => {
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

  return (
    <FormControlLabel
      label={label}
      htmlFor={path}
      required={required}
      disabled={disabled}
      control={
        <Switch
          id={path}
          name={name}
          checked={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          size={size}
        />
      }
    />
  );
};

export const FormTypeInputBooleanSwitchDefinition = {
  Component: FormTypeInputBooleanSwitch,
  test: ({ type, formType }) => type === 'boolean' && formType === 'switch',
} satisfies FormTypeInputDefinition;
