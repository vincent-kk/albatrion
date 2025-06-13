import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

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
  hideLabel?: boolean;
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
  hideLabel,
}: FormTypeInputBooleanSwitchProps) => {
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp, hideLabel]);

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
          defaultChecked={defaultValue}
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
