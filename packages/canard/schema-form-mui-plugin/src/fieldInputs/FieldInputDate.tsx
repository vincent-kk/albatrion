import { type ReactNode, useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getPickerSlotProps } from './utils/picker/getPickerSlotProps';
import { parsePickerLimit } from './utils/picker/parsePickerLimit';
import { usePickerValueChange } from './utils/picker/usePickerValueChange';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type DateJSONSchema = StringSchema & {
  format: 'date';
  minimum?: string; // date string
  maximum?: string; // date string
};

interface FieldInputDateProps
  extends FieldInputPropsWithSchema<string | null, DateJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  minimum?: string;
  maximum?: string;
}

const FieldInputDate = ({
  inputId,
  focusRef,
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
  hideLabel,
  misfit,
  minimum: minimumProp,
  maximum: maximumProp,
  className,
  style,
}: FieldInputDateProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

  const minimum = minimumProp ?? jsonSchema.minimum;
  const maximum = maximumProp ?? jsonSchema.maximum;
  const { minDate, maxDate } = useMemo(
    () => ({
      minDate: parsePickerLimit(minimum, 'YYYY-MM-DD'),
      maxDate: parsePickerLimit(maximum, 'YYYY-MM-DD'),
    }),
    [minimum, maximum],
  );

  const handleChange = usePickerValueChange(onChange, 'YYYY-MM-DD');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        defaultValue={
          typeof defaultValue === 'string' && defaultValue
            ? dayjs(defaultValue)
            : null
        }
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        minDate={minDate}
        maxDate={maxDate}
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
              focusRef,
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

export const FieldInputDateDefinition = {
  Component: FieldInputDate,
  test: ({ type, format }) => type === 'string' && format === 'date',
} satisfies FieldInputDefinition;
