import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

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

const DATE_FORMAT = 'HH:mm:00Z';

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
            dayjs(defaultValue[0], DATE_FORMAT),
            dayjs(defaultValue[1], DATE_FORMAT),
          ]
        : undefined,
    [defaultValue],
  );

  const disabledDate = useMemo(() => {
    return (date: Dayjs | null) => {
      if (!date) return false;
      if (!minimum && !maximum) return false;
      if (minimum && date.isBefore(dayjs(minimum, DATE_FORMAT), 'minute'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATE_FORMAT), 'minute'))
        return true;
      return false;
    };
  }, [minimum, maximum]);

  const handleChange = useHandle((range: OnChangeRangeValueType<Dayjs>) => {
    const [start, end] = range || [];
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
      disabledDate={disabledDate}
      defaultValue={initialValue}
      onChange={handleChange}
      onPanelChange={handleChange}
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
