import { useMemo } from 'react';

import { TimePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

const DATE_FORMAT = 'HH:mm:00Z';

interface FormTypeInputTimeProps
  extends FormTypeInputProps<string, { size?: SizeType }> {
  size?: SizeType;
}

const FormTypeInputTime = ({
  path,
  name,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputTimeProps) => {
  const handleChange = useHandle((date: Dayjs | null) => {
    onChange(date?.format(DATE_FORMAT));
  });
  const initialValue = useMemo(
    () => (defaultValue ? dayjs(defaultValue, DATE_FORMAT) : undefined),
    [defaultValue],
  );
  return (
    <TimePicker
      id={path}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      format={'HH:mm'}
      defaultValue={initialValue}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputTimeDefinition = {
  Component: FormTypeInputTime,
  test: {
    type: 'string',
    format: 'time',
  },
} satisfies FormTypeInputDefinition;
