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

import { parseTime } from './utils/time/parseTime';

const DATE_FORMAT = 'HH:mm:00Z';

type DateRangeSchema = ArraySchema & {
  items: StringSchema;
};

type RangeValueType<T> = Parameter<
  (typeof DatePicker<T>)['RangePicker']
>['defaultValue'];

type OnChangeRangeValueType<T> = RangeValueType<T> | null;

type DisabledTimeType<T> = Parameter<
  (typeof DatePicker<T>)['RangePicker']
>['disabledTime'];

type TimeLimits = ReturnType<NonNullable<DisabledTimeType<Dayjs>>>;

const MINUTES_PER_DAY = 24 * 60;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

/**
 * Converts an `HH:mm:00Z` limit to the local minute of the day the time panel shows.
 * @param limit - `minimum` or `maximum`; an empty or unparsable limit means no limit.
 * @returns Minutes since local midnight, or `undefined` when there is no limit.
 */
const toLocalMinute = (limit: string | undefined) => {
  if (!limit) return undefined;
  const time = parseTime(limit);
  return time.isValid() ? time.hour() * 60 + time.minute() : undefined;
};

/**
 * Tells whether a local minute of the day lies outside the selectable window.
 * @param minute - Minutes since local midnight.
 * @param minimum - Window start, inclusive; when later than `maximum` the window wraps past midnight.
 * @param maximum - Window end, inclusive.
 * @returns `true` when the minute cannot be selected.
 */
const isOutsideWindow = (
  minute: number,
  minimum = 0,
  maximum = MINUTES_PER_DAY - 1,
) =>
  minimum <= maximum
    ? minute < minimum || minute > maximum
    : minute < minimum && minute > maximum;

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
  id,
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
  'aria-labelledby': labelledBy,
}: FieldInputTimeRangeProps) => {
  const initialValue = useMemo<RangeValueType<Dayjs>>(
    () =>
      isArray(defaultValue) && defaultValue.length === 2
        ? [
            parseTime(defaultValue[0]),
            parseTime(defaultValue[1]),
          ]
        : undefined,
    [defaultValue],
  );

  const disabledTime = useMemo<DisabledTimeType<Dayjs>>(() => {
    if (!minimum && !maximum) return undefined;
    let limits: TimeLimits | undefined;
    // Limits are parsed when the panel first asks, so mounting parses nothing.
    return () => {
      if (limits) return limits;
      const start = toLocalMinute(minimum);
      const end = toLocalMinute(maximum);
      const isDisabled = (hour: number, minute: number) =>
        isOutsideWindow(hour * 60 + minute, start, end);
      limits = {
        disabledHours: () =>
          HOURS.filter((hour) =>
            MINUTES.every((minute) => isDisabled(hour, minute)),
          ),
        disabledMinutes: (hour: number) =>
          MINUTES.filter((minute) => isDisabled(hour, minute)),
      };
      return limits;
    };
  }, [minimum, maximum]);

  const handleChange = useHandle((range: OnChangeRangeValueType<Dayjs>) => {
    if (!range) return onChange(undefined);
    const [start, end] = range;
    if (!start || !end) return;
    onChange([start.format(DATE_FORMAT), end.format(DATE_FORMAT)]);
  });

  return (
    <DatePicker.RangePicker
      id={{ start: id, end: `${id}-end` }}
      aria-labelledby={labelledBy}
      name={name}
      disabled={disabled || readOnly}
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
