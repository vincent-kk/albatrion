import { type ReactNode, useMemo } from 'react';

import { Stack, Switch, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface StringSwitchJsonSchema extends StringSchema {
  formType: 'switch';
  enum: [string, string]; // 정확히 2개의 값만 허용
  switchSize?: 'small' | 'medium';
  switchLabels?: [string, string];
}

interface FormTypeInputStringSwitchProps
  extends FormTypeInputPropsWithSchema<string, StringSwitchJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
}

const FormTypeInputStringSwitch = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
}: FormTypeInputStringSwitchProps) => {
  const [label, size] = useMemo(() => {
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
    ];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

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

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked ? onValue : offValue);
    },
  );

  const switchSize = jsonSchema.switchSize || size;

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography>{offLabel}</Typography>
      <Switch
        id={path}
        name={name}
        defaultChecked={defaultValue === onValue}
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
