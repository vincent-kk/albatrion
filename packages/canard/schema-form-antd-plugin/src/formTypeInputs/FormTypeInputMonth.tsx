import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

const DATA_FORMAT = 'YYYY-MM';

interface FormTypeInputMonthProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputMonth = ({
  path,
  name,
  jsonSchema,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputMonthProps) => {
  const handleChange = useHandle((value: Dayjs | undefined) => {
    onChange(value?.format(DATA_FORMAT));
  });
  const initialValue = useMemo(
    () => (defaultValue ? dayjs(defaultValue, DATA_FORMAT) : undefined),
    [defaultValue],
  );
  const disabledDate = useMemo(() => {
    const { minimum, maximum } = jsonSchema.options || {};
    return (date: Dayjs | null) => {
      if (!date) return false;
      if (!minimum && !maximum) return false;
      if (minimum && date.isBefore(dayjs(minimum, DATA_FORMAT), 'month'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATA_FORMAT), 'month'))
        return true;
      return false;
    };
  }, [jsonSchema?.options]);

  return (
    <DatePicker
      id={path}
      name={name}
      picker="month"
      disabledDate={disabledDate}
      defaultValue={initialValue}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputMonthDefinition = {
  Component: FormTypeInputMonth,
  test: {
    type: 'string',
    format: 'month',
  },
} satisfies FormTypeInputDefinition;
