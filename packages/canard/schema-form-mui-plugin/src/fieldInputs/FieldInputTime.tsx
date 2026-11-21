import { type ReactNode, useMemo } from 'react';

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getPickerSlotProps } from './utils/picker/getPickerSlotProps';
import { usePickerValueChange } from './utils/picker/usePickerValueChange';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type TimeJSONSchema = StringSchema & {
  format: 'time';
  ampm?: boolean;
};

interface FieldInputTimeProps
  extends FieldInputPropsWithSchema<string | null, TimeJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  ampm?: boolean;
  hideLabel?: boolean;
}

const FieldInputTime = ({
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  ampm: ampmProp,
  hideLabel,
  misfit,
  className,
  style,
}: FieldInputTimeProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );
  const ampm = ampmProp ?? jsonSchema.ampm;

  const timeValue = useMemo(() => {
    if (typeof defaultValue !== 'string' || !defaultValue) return null;

    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(`${today}T${defaultValue}`);
  }, [defaultValue]);

  const handleChange = usePickerValueChange(onChange, 'HH:mm:ss');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        defaultValue={timeValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        ampm={ampm}
        slotProps={{
          textField: {
            className,
            style,
            ...getPickerSlotProps(
              inputId,
              labelId,
              getInputId,
              !!label,
              disabled,
            ),
            name,
            required,
            size,
            variant,
            fullWidth,
            error: misfit,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FieldInputTimeDefinition = {
  Component: FieldInputTime,
  test: ({ type, format }) => type === 'string' && format === 'time',
} satisfies FieldInputDefinition;
