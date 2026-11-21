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
  path,
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
    return () => ({
      disabledHours: () => disabledHours,
      disabledMinutes: (hour: number) =>
        MINUTES.filter((minute) =>
          outside(hour * 60 + minute, hour * 60 + minute),
        ),
    });
  }, [minimum, maximum]);

  const handleChange = usePickerRangeChange(onChange, TIME_FORMAT);

  return (
    <DatePicker.RangePicker
      id={path}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
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
