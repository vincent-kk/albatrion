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
  hideLabel?: boolean;
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
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
}: FormTypeInputMonthProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    jsonSchema,
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

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
            variant,
            fullWidth,
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
