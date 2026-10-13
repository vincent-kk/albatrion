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

const DATA_FORMAT = 'YYYY-MM-DD';

interface FormTypeInputDateProps
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

const FormTypeInputDate = ({
  path,
  name,
  defaultValue,
  onChange,
  context,
  size,
  minimum,
  maximum,
}: FormTypeInputDateProps) => {
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
      if (minimum && date.isBefore(dayjs(minimum, DATA_FORMAT), 'day'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATA_FORMAT), 'day'))
        return true;
      return false;
    };
  }, [minimum, maximum]);

  return (
    <DatePicker
      id={path}
      name={name}
      disabledDate={disabledDate}
      defaultValue={initialValue}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputDateDefinition = {
  Component: FormTypeInputDate,
  test: {
    type: 'string',
    format: 'date',
  },
} satisfies FormTypeInputDefinition;
