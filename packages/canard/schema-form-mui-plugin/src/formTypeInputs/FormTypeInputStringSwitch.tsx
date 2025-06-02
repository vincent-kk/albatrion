import { useMemo } from 'react';

import { Stack, Switch, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringSwitchJsonSchema extends StringSchema {
  formType: 'switch';
  enum: [string, string]; // 정확히 2개의 값만 허용
  switchSize?: 'small' | 'medium';
  switchLabels?: [string, string];
}

interface FormTypeInputStringSwitchProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringSwitchJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  label?: string;
}

const FormTypeInputStringSwitch = ({
  path,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
}: FormTypeInputStringSwitchProps) => {
  const { offValue, onValue, offLabel, onLabel } = useMemo(() => {
    const [first, second] = jsonSchema.enum;
    const [firstLabel, secondLabel] = jsonSchema.switchLabels || [
      first,
      second,
    ];

    return {
      offValue: first,
      onValue: second,
      offLabel: firstLabel,
      onLabel: secondLabel,
    };
  }, [jsonSchema.enum, jsonSchema.switchLabels]);

  const isChecked = value === onValue;

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked ? onValue : offValue);
    },
  );

  const switchSize = jsonSchema.switchSize || size || context?.size || 'medium';

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography>{offLabel}</Typography>
      <Switch
        id={path}
        name={name}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        size={switchSize}
      />
      <Typography>{onLabel}</Typography>
    </Stack>
  );
};

export const FormTypeInputStringSwitchDefinition = {
  Component: FormTypeInputStringSwitch,
  test: ({ type, formType, jsonSchema }) =>
    type === 'string' &&
    formType === 'switch' &&
    jsonSchema.enum &&
    jsonSchema.enum.length === 2,
} satisfies FormTypeInputDefinition;
