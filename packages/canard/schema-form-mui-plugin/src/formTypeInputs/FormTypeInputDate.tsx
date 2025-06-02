import { useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface DateJsonSchema extends StringSchema {
  format: 'date';
  minimum?: string; // date string
  maximum?: string; // date string
}

interface FormTypeInputDateProps
  extends FormTypeInputPropsWithSchema<
    string,
    DateJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  label?: string;
}

const FormTypeInputDate = ({
  path,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
  label,
}: FormTypeInputDateProps) => {
  const { minDate, maxDate } = useMemo(() => {
    return {
      minDate: jsonSchema.minimum ? dayjs(jsonSchema.minimum) : undefined,
      maxDate: jsonSchema.maximum ? dayjs(jsonSchema.maximum) : undefined,
    };
  }, [jsonSchema.minimum, jsonSchema.maximum]);

  const dateValue = useMemo(() => {
    return value ? dayjs(value) : null;
  }, [value]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  });

  const disableDate = useHandle((date: Dayjs) => {
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label || 'Select date'}
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        shouldDisableDate={disableDate}
        slotProps={{
          textField: {
            id: path,
            name,
            size: size || context?.size || 'medium',
            variant: 'outlined',
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FormTypeInputDateDefinition = {
  Component: FormTypeInputDate,
  test: ({ type, format }) => type === 'string' && format === 'date',
} satisfies FormTypeInputDefinition;
