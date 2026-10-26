import { type ReactNode, useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type MonthJSONSchema = StringSchema & {
  format: 'month';
};

interface FieldInputMonthProps
  extends FieldInputPropsWithSchema<string | null, MonthJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputMonth = ({
  path,
  name,
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
  misfit,
}: FieldInputMonthProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue === null) {
      onChange(undefined);
      return;
    }
    if (!newValue.isValid()) return;
    onChange(newValue.format('YYYY-MM'));
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
            error: misfit,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FieldInputMonthDefinition = {
  Component: FieldInputMonth,
  test: ({ type, format }) => type === 'string' && format === 'month',
} satisfies FieldInputDefinition;
