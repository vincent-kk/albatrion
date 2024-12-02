import { useMemo } from 'react';

import { TimePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-pack/schema-form';

const DATE_FORMAT = 'HH:mm:00Z';

const FormTypeInputTime = ({
  path,
  name,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
}: FormTypeInputProps<string, { size?: SizeType }>) => {
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
      size={context?.size}
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
