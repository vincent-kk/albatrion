import { useMemo } from 'react';

import { TimePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const DATE_FORMAT = 'HH:mm:00Z';

interface FieldInputTimeProps
  extends FieldInputProps<string | null, { size?: SizeType }> {
  size?: SizeType;
}

const FieldInputTime = ({
  path,
  name,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size,
  misfit,
}: FieldInputTimeProps) => {
  const handleChange = useHandle((date: Dayjs | null) => {
    onChange(date?.format(DATE_FORMAT) || '');
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
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputTimeDefinition = {
  Component: FieldInputTime,
  test: {
    type: 'string',
    format: 'time',
  },
} satisfies FieldInputDefinition;
