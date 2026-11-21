import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';
import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  /** State labels keyed by stored enum value; context.switchLabels takes priority. */
  alias?: { [value: string]: ReactNode };
}

const FieldInputStringSwitch = ({
  inputId,
  labelId: fieldTitleId,
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
  alias,
}: FieldInputStringSwitchProps) => {
  useFieldLabelAssociation(inputId, fieldTitleId, labelProp);
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
    ];
  }, [hideLabel, sizeProp, context.size, jsonSchema, labelProp, name]);

  const { offValue, onValue, offLabel, onLabel } = useMemo(() => {
    const [first, second] = jsonSchema.enum;
    const labels = context.switchLabels || alias;
    const [firstLabel, secondLabel] = labels
      ? [
          getOwnLabel(labels, String(first)) || first,
          getOwnLabel(labels, String(second)) || second,
        ]
      : jsonSchema.switchLabels || [first, second];

    return {
      offValue: second,
      onValue: first,
      offLabel: secondLabel,
      onLabel: firstLabel,
    };
  }, [jsonSchema.enum, jsonSchema.switchLabels, context.switchLabels, alias]);

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked ? onValue : offValue);
    },
  );

  const switchSize = jsonSchema.switchSize || size;

  return (
    <FormControlLabel
      label={label}
      htmlFor={inputId}
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
            id={inputId}
            name={name}
            checked={value === onValue}
            onChange={handleChange}
            disabled={disabled}
            size={switchSize}
            slotProps={{
              input: {
                'aria-labelledby': fieldTitleId,
                role: 'switch',
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
