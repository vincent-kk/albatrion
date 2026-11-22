import { useMemo } from 'react';

import { DatePicker } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { PickerPresentation } from './utils/picker/PickerPresentation';
import { getPickerDateLimits } from './utils/picker/getPickerDateLimits';
import { parsePickerValue } from './utils/picker/parsePickerValue';

const DATA_FORMAT = 'YYYY-MM-DD';

type FieldInputDateProps = FieldInputPropsWithSchema<
  string | null,
  StringSchema,
  { size?: SizeType }
> &
  PickerPresentation;

const FieldInputDate = ({
  inputId,
  name,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  size,
  minimum,
  maximum,
  misfit,
  labelId,
  required,
  placeholder,
  className,
  style,
}: FieldInputDateProps) => {
  const handleChange = useHandle((value: Dayjs | null) => {
    onChange(value ? value.format(DATA_FORMAT) : undefined);
  });
  const initialValue = useMemo(
    () =>
      defaultValue ? parsePickerValue(defaultValue, DATA_FORMAT) : undefined,
    [defaultValue],
  );
  const disabledDate = useMemo(
    () => getPickerDateLimits(minimum, maximum, DATA_FORMAT, 'day'),
    [minimum, maximum],
  );

  return (
    <DatePicker
      className={className}
      style={style}
      aria-labelledby={labelId}
      aria-required={required || undefined}
      placeholder={placeholder}
      id={inputId}
      name={name}
      disabled={disabled || readOnly}
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
