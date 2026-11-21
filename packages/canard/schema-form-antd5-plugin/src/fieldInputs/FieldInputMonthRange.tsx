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
import { getRangePickerId } from './utils/picker/getRangePickerId';
import { usePickerRangeChange } from './utils/picker/usePickerRangeChange';

const DATE_FORMAT = 'YYYY-MM';

type MonthRangeSchema = ArraySchema & {
  items: StringSchema;
};

type FieldInputMonthRangeProps = FieldInputPropsWithSchema<
  [string | null, string | null] | null,
  MonthRangeSchema,
  { size?: SizeType }
> &
  PickerPresentation;

const FieldInputMonthRange = ({
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
}: FieldInputMonthRangeProps) => {
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
      id={getRangePickerId(inputId, getInputId)}
      aria-labelledby={labelId}
      name={name}
      picker="month"
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

export const FieldInputMonthRangeDefinition = {
  Component: FieldInputMonthRange,
  test: ({ type, format, inputType, jsonSchema }) =>
    type === 'array' &&
    (format === 'month-range' || inputType === 'monthRange') &&
    isStringSchema(jsonSchema.items),
} satisfies FieldInputDefinition;
