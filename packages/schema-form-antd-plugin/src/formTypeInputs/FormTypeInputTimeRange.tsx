import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@lumy-pack/common-react';
import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@lumy-pack/schema-form';

const DATE_FORMAT = 'HH:mm:00Z';

interface DateRangeSchema extends ArraySchema {
  items: StringSchema;
}

type RangeValueType<T> = Parameter<
  (typeof DatePicker<T>)['RangePicker']
>['defaultValue'];

type OnChangeRangeValueType<T> = RangeValueType<T> | null;

const FormTypeInputTimeRange = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  [string, string],
  DateRangeSchema,
  { size?: SizeType }
>) => {
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
      if (minimum && date.isBefore(dayjs(minimum, DATE_FORMAT), 'minute'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATE_FORMAT), 'minute'))
        return true;
      return false;
    };
  }, [jsonSchema?.options]);

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
      size={context?.size}
    />
  );
};

export const FormTypeInputTimeRangeDefinition = {
  Component: FormTypeInputTimeRange,
  test: ({ type, format, formType, jsonSchema }) =>
    type === 'array' &&
    (format === 'time-range' || formType === 'timeRange') &&
    jsonSchema.items?.type === 'string',
} satisfies FormTypeInputDefinition;
