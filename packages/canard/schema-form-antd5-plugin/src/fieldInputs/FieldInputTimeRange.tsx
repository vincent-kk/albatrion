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
import { getPickerRangeValue } from './utils/picker/getPickerRangeValue';
import { getRangePickerId } from './utils/picker/getRangePickerId';
import { TIME_FORMAT, parsePickerValue } from './utils/picker/parsePickerValue';
import { usePickerRangeChange } from './utils/picker/usePickerRangeChange';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

type DateRangeSchema = ArraySchema & {
  items: StringSchema;
};

type FieldInputTimeRangeProps = FieldInputPropsWithSchema<
  [string | null, string | null] | null,
  DateRangeSchema,
  { size?: SizeType }
> &
  PickerPresentation;

const FieldInputTimeRange = ({
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
}: FieldInputTimeRangeProps) => {
  const initialValue = useMemo(
    () => getPickerRangeValue(defaultValue, TIME_FORMAT),
    [defaultValue],
  );

  const disabledTime = useMemo(() => {
    if (!minimum && !maximum) return undefined;
    const start = minimum ? parsePickerValue(minimum, TIME_FORMAT) : undefined;
    const end = maximum ? parsePickerValue(maximum, TIME_FORMAT) : undefined;
    const first = start?.isValid() ? start.hour() * 60 + start.minute() : 0;
    const last = end?.isValid() ? end.hour() * 60 + end.minute() : 1439;
    const outside = (startMinute: number, endMinute: number) =>
      first <= last
        ? endMinute < first || startMinute > last
        : endMinute < first && startMinute > last;
    const disabledHours = HOURS.filter((hour) =>
      outside(hour * 60, hour * 60 + 59),
    );
    const limits = {
      disabledHours: () => disabledHours,
      disabledMinutes: (hour: number) => {
        const hourStart = hour * 60;
        const hourEnd = hourStart + 59;
        if (outside(hourStart, hourEnd)) return MINUTES;
        if (
          !(
            (first >= hourStart && first <= hourEnd) ||
            (last >= hourStart && last <= hourEnd)
          )
        )
          return [];
        return MINUTES.filter((minute) => {
          const time = hourStart + minute;
          return outside(time, time);
        });
      },
    };
    return () => limits;
  }, [minimum, maximum]);

  const handleChange = usePickerRangeChange(onChange, TIME_FORMAT);

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
      disabled={disabled || readOnly}
      format={TIME_FORMAT}
      showTime={{ format: 'HH:mm' }}
      disabledTime={disabledTime}
      defaultValue={initialValue}
      onChange={handleChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputTimeRangeDefinition = {
  Component: FieldInputTimeRange,
  test: ({ type, format, inputType, jsonSchema }) =>
    type === 'array' &&
    (format === 'time-range' || inputType === 'timeRange') &&
    isStringSchema(jsonSchema.items),
} satisfies FieldInputDefinition;
