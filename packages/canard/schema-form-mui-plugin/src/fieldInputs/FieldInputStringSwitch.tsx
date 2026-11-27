import type { ReactNode } from 'react';

import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getOwnLabel } from './utils/enum/getOwnLabel';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type StringSwitchJSONSchema = StringSchema & {
  enum: [string | null, string | null];
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
  alias?: Record<string, ReactNode>;
}

const FieldInputStringSwitch = ({
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  alias,
  label: labelProp,
  size: sizeProp,
  hideLabel,
  misfit,
  className,
  style,
}: FieldInputStringSwitchProps) => {
  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

  const [onValue, offValue] = jsonSchema.enum;
  const labels = context.switchLabels || alias;
  const [onLabel, offLabel] = labels
    ? [
        getOwnLabel(labels, String(onValue)) || onValue,
        getOwnLabel(labels, String(offValue)) || offValue,
      ]
    : jsonSchema.switchLabels || [onValue, offValue];

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked ? onValue : offValue);
    },
  );

  const switchSize = jsonSchema.switchSize || size;

  const captionId = label ? getInputId('legend') : undefined;

  return (
    <FormControlLabel
      className={className}
      style={style}
      label={label && <span id={captionId}>{label}</span>}
      htmlFor={inputId}
      required={required}
      disabled={disabled || readOnly}
      labelPlacement="start"
      sx={{
        alignItems: 'center',
        gap: 1,
      }}
      control={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>{offLabel}</Typography>
          <Switch
            id={inputId}
            name={name}
            checked={value === onValue}
            onChange={handleChange}
            disabled={disabled || readOnly}
            size={switchSize}
            slotProps={{
              input: {
                role: 'switch',
                'aria-labelledby': captionId ?? labelId,
                'aria-invalid': misfit || undefined,
              },
            }}
          />
          <Typography>{onLabel}</Typography>
        </Stack>
      }
    />
  );
};

export const FieldInputStringSwitchDefinition = {
  Component: FieldInputStringSwitch,
  controlled: true,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    inputType === 'switch' &&
    jsonSchema.enum?.length === 2,
} satisfies FieldInputDefinition;
