import { useMemo } from 'react';

import { TimePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useNativeFieldName } from '../utils/useNativeFieldName';
import { parseTime } from './utils/time/parseTime';

const DATE_FORMAT = 'HH:mm:00Z';

interface FieldInputTimeProps
  extends FieldInputProps<string | null, { size?: SizeType }> {
  size?: SizeType;
}

const FieldInputTime = ({
  inputId,
  labelId,
  jsonSchema,
  name,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size,
  misfit,
}: FieldInputTimeProps) => {
  const naming = useNativeFieldName(
    inputId,
    labelId,
    useFieldNameFallback(jsonSchema, name),
  );
  const handleChange = useHandle((date: Dayjs | null) => {
    onChange(date ? date.format(DATE_FORMAT) : undefined);
  });
  const initialValue = useMemo(
    () => (defaultValue ? parseTime(defaultValue) : undefined),
    [defaultValue],
  );
  return (
    <TimePicker
      id={inputId}
      {...naming}
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
