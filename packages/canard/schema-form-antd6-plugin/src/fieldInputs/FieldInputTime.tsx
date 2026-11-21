import { useMemo } from 'react';

import { TimePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import { TIME_FORMAT, parsePickerValue } from './utils/picker/parsePickerValue';

interface FieldInputTimeProps
  extends FieldInputProps<string | null, { size?: SizeType }> {
  size?: SizeType;
}

const FieldInputTime = ({
  inputId,
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
    onChange(date ? date.format(TIME_FORMAT) : undefined);
  });
  const initialValue = useMemo(
    () =>
      defaultValue ? parsePickerValue(defaultValue, TIME_FORMAT) : undefined,
    [defaultValue],
  );
  return (
    <TimePicker
      id={inputId}
      name={name}
      disabled={disabled || readOnly}
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
