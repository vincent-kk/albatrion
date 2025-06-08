import { type ReactNode, useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface DateJsonSchema extends StringSchema {
  format: 'date';
  minimum?: string; // date string
  maximum?: string; // date string
}

interface FormTypeInputDateProps
  extends FormTypeInputPropsWithSchema<string, DateJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FormTypeInputDate = ({
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
}: FormTypeInputDateProps) => {
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

  const { minDate, maxDate } = useMemo(() => {
    return {
      minDate: jsonSchema.minimum ? dayjs(jsonSchema.minimum) : undefined,
      maxDate: jsonSchema.maximum ? dayjs(jsonSchema.maximum) : undefined,
    };
  }, [jsonSchema.minimum, jsonSchema.maximum]);

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
        label={label}
        defaultValue={defaultValue ? dayjs(defaultValue) : null}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        shouldDisableDate={disableDate}
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

export const FormTypeInputDateDefinition = {
  Component: FormTypeInputDate,
  test: ({ type, format }) => type === 'string' && format === 'date',
} satisfies FormTypeInputDefinition;
