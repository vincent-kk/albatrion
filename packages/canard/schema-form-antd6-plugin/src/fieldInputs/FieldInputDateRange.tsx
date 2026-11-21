import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { isStringSchema } from '@winglet/json-schema/filter';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { PickerPresentation } from './utils/picker/PickerPresentation';
import { getPickerDateLimits } from './utils/picker/getPickerDateLimits';
import { getPickerRangeValue } from './utils/picker/getPickerRangeValue';
import { usePickerRangeChange } from './utils/picker/usePickerRangeChange';

const DATE_FORMAT = 'YYYY-MM-DD';

type DateRangeSchema = ArraySchema & {
  items: StringSchema;
};

type FieldInputDateRangeProps = FieldInputPropsWithSchema<
  [string | null, string | null] | null,
  DateRangeSchema,
  { size?: SizeType }
> &
  PickerPresentation;

const FieldInputDateRange = ({
  inputId,
  labelId,
  getInputId,
  name,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
  minimum,
  maximum,
  misfit,
}: FieldInputDateRangeProps) => {
  const handleChange = usePickerRangeChange(onChange, DATE_FORMAT);

  const initialValue = useMemo(
    () => getPickerRangeValue(defaultValue, DATE_FORMAT),
    [defaultValue],
  );
  const disabledDate = useMemo(
    () => getPickerDateLimits(minimum, maximum, DATE_FORMAT, 'day'),
    [minimum, maximum],
  );

  return (
    <DatePicker.RangePicker
      id={{ start: inputId, end: getInputId('end') }}
      aria-labelledby={labelId}
      name={name}
      picker="date"
      disabled={disabled || readOnly}
      disabledDate={disabledDate}
      defaultValue={initialValue}
      onChange={handleChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputDateRangeDefinition = {
  Component: FieldInputDateRange,
  test: ({ type, format, inputType, jsonSchema }) =>
    type === 'array' &&
    (format === 'date-range' || inputType === 'dateRange') &&
    isStringSchema(jsonSchema.items),
} satisfies FieldInputDefinition;
