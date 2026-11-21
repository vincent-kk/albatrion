import type { ReactNode } from 'react';

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

type MonthJSONSchema = StringSchema & {
  format: 'month';
};

interface FieldInputMonthProps
  extends FieldInputPropsWithSchema<string | null, MonthJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  minimum?: string;
  maximum?: string;
}

const FieldInputMonth = ({
  inputId,
  labelId,
  getInputId,
  name,
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
  minimum,
  maximum,
}: FieldInputMonthProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

  const handleChange = usePickerValueChange(onChange, 'YYYY-MM');

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
        minDate={parsePickerLimit(minimum, 'YYYY-MM')}
        maxDate={parsePickerLimit(maximum, 'YYYY-MM')}
        disabled={disabled}
        readOnly={readOnly}
        views={['year', 'month']}
        openTo="month"
        format="YYYY-MM"
        slotProps={{
          textField: {
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

export const FieldInputMonthDefinition = {
  Component: FieldInputMonth,
  test: ({ type, format }) => type === 'string' && format === 'month',
} satisfies FieldInputDefinition;
