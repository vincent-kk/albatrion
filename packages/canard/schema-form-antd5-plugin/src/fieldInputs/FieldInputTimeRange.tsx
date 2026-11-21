import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import type { Dayjs } from 'dayjs';

import { isArray } from '@winglet/common-utils/filter';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { Parameter } from '@aileron/declare';

import { parsePickerValue } from './utils/picker/parsePickerValue';

const DATE_FORMAT = 'HH:mm:00Z';
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

type DateRangeSchema = ArraySchema & {
  items: StringSchema;
};

type RangeValueType<T> = Parameter<
  (typeof DatePicker<T>)['RangePicker']
>['defaultValue'];

type OnChangeRangeValueType<T> = RangeValueType<T> | null;

interface FieldInputTimeRangeProps
  extends FieldInputPropsWithSchema<
    [string | null, string | null] | null,
    DateRangeSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  /** Earliest selectable value, from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest selectable value, from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
}

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
  const initialValue = useMemo<RangeValueType<Dayjs>>(
    () =>
      isArray(defaultValue) && defaultValue.length === 2
        ? [
            parsePickerValue(defaultValue[0], DATE_FORMAT),
            parsePickerValue(defaultValue[1], DATE_FORMAT),
          ]
        : undefined,
    [defaultValue],
  );

  const disabledTime = useMemo(() => {
    if (!minimum && !maximum) return undefined;
    const start = minimum ? parsePickerValue(minimum, DATE_FORMAT) : undefined;
    const end = maximum ? parsePickerValue(maximum, DATE_FORMAT) : undefined;
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

  const handleChange = useHandle((range: OnChangeRangeValueType<Dayjs>) => {
    if (!range) return onChange(undefined);
    const [start, end] = range;
    if (!start || !end) return;
    onChange([start.format(DATE_FORMAT), end.format(DATE_FORMAT)]);
  });

  return (
    <DatePicker.RangePicker
      id={path}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      format={DATE_FORMAT}
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
