import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { Parameter } from '@aileron/declare';

const DATE_FORMAT = 'YYYY-MM-DD';

interface DateRangeSchema extends ArraySchema {
  items: StringSchema;
}

type RangeValueType<T> = Parameter<
  (typeof DatePicker<T>)['RangePicker']
>['defaultValue'];

type OnChangeRangeValueType<T> = RangeValueType<T> | null;

interface FormTypeInputDateRangeProps
  extends FormTypeInputPropsWithSchema<
    [string, string],
    DateRangeSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputDateRange = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputDateRangeProps) => {
  const handleChange = useHandle((range: OnChangeRangeValueType<Dayjs>) => {
    const [start, end] = range || [];
    if (!start || !end) return;
    onChange([start.format(DATE_FORMAT), end.format(DATE_FORMAT)]);
  });

  const initialValue = useMemo<RangeValueType<Dayjs>>(
    () =>
      defaultValue?.length === 2
        ? [
            dayjs(defaultValue[0], DATE_FORMAT),
            dayjs(defaultValue[1], DATE_FORMAT),
          ]
        : undefined,
    [defaultValue],
  );
  const disabledDate = useMemo(() => {
    const { minimum, maximum } = jsonSchema.options || {};
    return (date: Dayjs | null) => {
      if (!date) return false;
      if (!minimum && !maximum) return false;
      if (minimum && date.isBefore(dayjs(minimum, DATE_FORMAT), 'day'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATE_FORMAT), 'day'))
        return true;
      return false;
    };
  }, [jsonSchema?.options]);

  return (
    <DatePicker.RangePicker
      id={path}
      name={name}
      picker="date"
      disabled={disabled}
      readOnly={readOnly}
      disabledDate={disabledDate}
      defaultValue={initialValue}
      onChange={handleChange}
      onPanelChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputDateRangeDefinition = {
  Component: FormTypeInputDateRange,
  test: ({ type, format, formType, jsonSchema }) =>
    type === 'array' &&
    (format === 'date-range' || formType === 'dateRange') &&
    jsonSchema.items?.type === 'string',
} satisfies FormTypeInputDefinition;
