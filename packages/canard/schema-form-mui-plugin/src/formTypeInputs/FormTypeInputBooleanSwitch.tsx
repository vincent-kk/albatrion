import { FormControlLabel, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

interface BooleanSwitchJsonSchema extends BooleanSchema {
  formType: 'switch';
  switchSize?: 'small' | 'medium';
  checkedLabel?: string;
  uncheckedLabel?: string;
}

interface FormTypeInputBooleanSwitchProps
  extends FormTypeInputPropsWithSchema<
    boolean,
    BooleanSwitchJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  label?: string;
}

const FormTypeInputBooleanSwitch = ({
  path,
  name,
  label,
  required,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
}: FormTypeInputBooleanSwitchProps) => {
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const switchSize = jsonSchema.switchSize || size || context?.size;
  const checked = !!value;

  return (
    <FormControlLabel
      label={label || name}
      htmlFor={path}
      required={required}
      disabled={disabled}
      control={
        <Switch
          id={path}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          size={switchSize}
        />
      }
    />
  );
};

export const FormTypeInputBooleanSwitchDefinition = {
  Component: FormTypeInputBooleanSwitch,
  test: ({ type, formType }) => type === 'boolean' && formType === 'switch',
} satisfies FormTypeInputDefinition;
