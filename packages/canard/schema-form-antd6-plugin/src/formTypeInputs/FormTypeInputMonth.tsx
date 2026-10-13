import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

const DATA_FORMAT = 'YYYY-MM';

interface FormTypeInputMonthProps
  extends FormTypeInputPropsWithSchema<
    string | null,
    StringSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  /** Earliest selectable value, from `presentation.FormTypeInputProps.minimum`. */
  minimum?: string;
  /** Latest selectable value, from `presentation.FormTypeInputProps.maximum`. */
  maximum?: string;
}

const FormTypeInputMonth = ({
  path,
  name,
  defaultValue,
  onChange,
  context,
  size,
  minimum,
  maximum,
}: FormTypeInputMonthProps) => {
  const handleChange = useHandle((value: Dayjs | null) => {
    onChange(value?.format(DATA_FORMAT) || '');
  });
  const initialValue = useMemo(
    () => (defaultValue ? dayjs(defaultValue, DATA_FORMAT) : undefined),
    [defaultValue],
  );
  const disabledDate = useMemo(() => {
    return (date: Dayjs | null) => {
      if (!date) return false;
      if (!minimum && !maximum) return false;
      if (minimum && date.isBefore(dayjs(minimum, DATA_FORMAT), 'month'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATA_FORMAT), 'month'))
        return true;
      return false;
    };
  }, [minimum, maximum]);

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
