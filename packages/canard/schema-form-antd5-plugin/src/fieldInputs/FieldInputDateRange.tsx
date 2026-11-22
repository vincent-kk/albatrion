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
  required,
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
  placeholder,
  className,
  style,
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
      className={className}
      style={style}
      placeholder={
        placeholder === undefined ? undefined : [placeholder, placeholder]
      }
      id={getRangePickerId(inputId, getInputId)}
      aria-labelledby={labelId}
      aria-required={required || undefined}
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
