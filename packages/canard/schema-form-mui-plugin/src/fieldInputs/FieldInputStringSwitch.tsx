import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type StringSwitchJSONSchema = StringSchema & {
  enum: [string | null, string | null]; // 정확히 2개의 값만 허용
  switchSize?: 'small' | 'medium';
  switchLabels?: [string, string];
  hideLabel?: boolean;
};

interface FieldInputStringSwitchProps
  extends FieldInputPropsWithSchema<
      string | null,
      StringSwitchJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
}

const FieldInputStringSwitch = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  value,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  misfit,
}: FieldInputStringSwitchProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [hideLabel, sizeProp, context.size, labelProp, name]);

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
    <>
    <FormControlLabel
      label={label}
      htmlFor={path}
      required={required}
      disabled={disabled}
      labelPlacement="start"
      sx={{
        alignItems: 'center',
        gap: 1,
      }}
      control={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>{offLabel}</Typography>
          <Switch
            id={path}
            name={name}
            checked={value === onValue}
            onChange={handleChange}
            disabled={disabled}
            size={switchSize}
            slotProps={{ input: { 'aria-invalid': misfit || undefined } }}
          />
          <Typography>{onLabel}</Typography>
        </Stack>
      }
    />
    {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputStringSwitchDefinition = {
  Component: FieldInputStringSwitch,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    inputType === 'switch' &&
    jsonSchema.enum?.length === 2,
} satisfies FieldInputDefinition;
