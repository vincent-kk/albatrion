import { type ChangeEvent, useMemo } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@/schema-form/types';

type DateFormatJsonSchema = {
  type: 'string';
  format: 'month' | 'week' | 'date' | 'date-time' | 'time';
  options?: {
    minimum?: string;
    maximum?: string;
  };
};

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
}: FormTypeInputPropsWithSchema<string, DateFormatJsonSchema>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  const { type, max, min } = useMemo(
    () => ({
      type: jsonSchema.format,
      max: jsonSchema.options?.maximum,
      min: jsonSchema.options?.minimum,
    }),
    [jsonSchema],
  );
  return (
    <input
      type={type}
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      max={max}
      min={min}
      defaultValue={defaultValue}
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
