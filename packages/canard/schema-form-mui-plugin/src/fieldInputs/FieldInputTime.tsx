import { type ReactNode, useMemo } from 'react';

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type TimeJSONSchema = StringSchema & {
  format: 'time';
  ampm?: boolean;
};

interface FieldInputTimeProps
  extends FieldInputPropsWithSchema<string | null, TimeJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  ampm?: boolean;
  hideLabel?: boolean;
}

const FieldInputTime = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  ampm: ampmProp,
  hideLabel,
}: FieldInputTimeProps) => {
  const [label, size, variant, fullWidth, ampm] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
        ampmProp ?? jsonSchema.ampm,
      ];
    return [
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
      ampmProp ?? jsonSchema.ampm,
    ];
  }, [
    jsonSchema,
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    ampmProp,
    hideLabel,
  ]);

  const timeValue = useMemo(() => {
    if (!defaultValue) return null;

    // time 형식이 HH:mm 또는 HH:mm:ss인 경우
    // dayjs에서 파싱하기 위해 오늘 날짜와 결합
    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(`${today}T${defaultValue}`);
  }, [defaultValue]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format('HH:mm:ss'));
    } else {
      onChange(null);
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        defaultValue={timeValue}
        onChange={handleChange}
        disabled={disabled}
        ampm={ampm}
        slotProps={{
          textField: {
            id: path,
            name,
            required,
            size,
            variant,
            fullWidth,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FieldInputTimeDefinition = {
  Component: FieldInputTime,
  test: ({ type, format }) => type === 'string' && format === 'time',
} satisfies FieldInputDefinition;
