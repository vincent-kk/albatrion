import { type ChangeEvent, useMemo } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

type DateFormatJsonSchema = {
  format: 'month' | 'week' | 'date' | 'date-time' | 'time';
} & StringSchema<{ minimum?: string; maximum?: string }>;

const FormTypeInputDateFormat = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  style,
  className,
}: FormTypeInputPropsWithSchema<string | null, DateFormatJsonSchema>) => {
  const { type, max, min } = useMemo(
    () => ({
      type: jsonSchema.format,
      max: jsonSchema.options?.maximum,
      min: jsonSchema.options?.minimum,
    }),
    [jsonSchema],
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  return (
    <input
      type={type}
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      max={max}
      min={min}
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
      style={style}
      className={className}
    />
  );
};

export const FormTypeInputDateFormatDefinition = {
  Component: FormTypeInputDateFormat,
  test: {
    type: 'string',
    format: ['month', 'week', 'date', 'time', 'datetime-local'],
  },
} satisfies FormTypeInputDefinition;
