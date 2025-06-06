import { type ReactNode, useMemo } from 'react';

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

import type { MuiContext } from '../type';

interface MonthJsonSchema extends StringSchema {
  format: 'month';
}

interface FormTypeInputMonthProps
  extends FormTypeInputPropsWithSchema<string, MonthJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
}

const FormTypeInputMonth = ({
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
}: FormTypeInputMonthProps) => {
  const [label, size] = useMemo(() => {
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
    ];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format('YYYY-MM'));
    } else {
      onChange('');
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        defaultValue={defaultValue ? dayjs(defaultValue) : null}
        onChange={handleChange}
        disabled={disabled}
        views={['year', 'month']}
        openTo="month"
        format="YYYY-MM"
        slotProps={{
          textField: {
            id: path,
            name,
            required,
            size,
            variant: 'outlined',
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FormTypeInputMonthDefinition = {
  Component: FormTypeInputMonth,
  test: ({ type, format }) => type === 'string' && format === 'month',
} satisfies FormTypeInputDefinition;
