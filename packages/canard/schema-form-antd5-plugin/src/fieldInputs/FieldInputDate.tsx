import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

const DATA_FORMAT = 'YYYY-MM-DD';

interface FieldInputDateProps
  extends FieldInputPropsWithSchema<
    string | null,
    StringSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  /** Earliest selectable value, from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest selectable value, from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
}

const FieldInputDate = ({
  path,
  name,
  defaultValue,
  onChange,
  context,
  size,
  minimum,
  maximum,
  misfit,
}: FieldInputDateProps) => {
  const handleChange = useHandle((value: Dayjs | undefined) => {
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
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputDateDefinition = {
  Component: FieldInputDate,
  test: {
    type: 'string',
    format: 'date',
  },
} satisfies FieldInputDefinition;
