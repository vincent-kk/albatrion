import { useMemo } from 'react';

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface TimeJsonSchema extends StringSchema {
  format: 'time';
}

interface FormTypeInputTimeProps
  extends FormTypeInputPropsWithSchema<
    string,
    TimeJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  label?: string;
  ampm?: boolean;
}

const FormTypeInputTime = ({
  path,
  name,
  disabled,
  value,
  onChange,
  context,
  size,
  label,
  ampm = false,
}: FormTypeInputTimeProps) => {
  const timeValue = useMemo(() => {
    if (!value) return null;

    // time 형식이 HH:mm 또는 HH:mm:ss인 경우
    // dayjs에서 파싱하기 위해 오늘 날짜와 결합
    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(`${today}T${value}`);
  }, [value]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format('HH:mm:ss'));
    } else {
      onChange('');
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label || 'Select time'}
        value={timeValue}
        onChange={handleChange}
        disabled={disabled}
        ampm={ampm}
        slotProps={{
          textField: {
            id: path,
            name,
            size: size || context?.size,
            variant: 'outlined',
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FormTypeInputTimeDefinition = {
  Component: FormTypeInputTime,
  test: ({ type, format }) => type === 'string' && format === 'time',
} satisfies FormTypeInputDefinition;
