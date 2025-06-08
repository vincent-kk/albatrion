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
    string,
    StringSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputDate = ({
  path,
  name,
  jsonSchema,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputDateProps) => {
  const handleChange = useHandle((value: Dayjs | undefined) => {
    onChange(value?.format(DATA_FORMAT) || '');
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
      if (minimum && date.isBefore(dayjs(minimum, DATA_FORMAT), 'day'))
        return true;
      if (maximum && date.isAfter(dayjs(maximum, DATA_FORMAT), 'day'))
        return true;
      return false;
    };
  }, [jsonSchema?.options]);

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
