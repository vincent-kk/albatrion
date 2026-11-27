import type { ReactNode } from 'react';

import { FormControlLabel, Stack, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getOwnLabel } from './utils/enum/getOwnLabel';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type BooleanSwitchJSONSchema = BooleanSchema & {};

interface FieldInputBooleanSwitchProps
  extends FieldInputPropsWithSchema<
      boolean | null,
      BooleanSwitchJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: { checked?: ReactNode; unchecked?: ReactNode };
  hideLabel?: boolean;
}

const FieldInputBooleanSwitch = ({
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
  alias,
  label: labelProp,
  size: sizeProp,
  hideLabel,
  misfit,
  className,
  style,
}: FieldInputBooleanSwitchProps) => {
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

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
      control={
        <Stack direction="row" alignItems="center">
          <Switch
            id={inputId}
            name={name}
            checked={value === true}
            onChange={handleChange}
            disabled={disabled || readOnly}
            size={size}
            slotProps={{
              input: {
                role: 'switch',
                'aria-labelledby': captionId ?? labelId,
                'aria-invalid': misfit || undefined,
              },
            }}
          />
          {getOwnLabel(
            context.checkboxLabels || alias,
            value === true ? 'checked' : 'unchecked',
          )}
        </Stack>
      }
    />
  );
};

export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  controlled: true,
  test: ({ type, inputType }) => type === 'boolean' && inputType === 'switch',
} satisfies FieldInputDefinition;
