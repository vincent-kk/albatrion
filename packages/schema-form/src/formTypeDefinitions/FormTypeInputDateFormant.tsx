import { type ChangeEvent, useMemo } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputPropsWithSchema } from '@lumy/schema-form/types';

type DateFormatJsonSchema = {
  type: 'string';
  format: 'month' | 'week' | 'date' | 'date-time' | 'time';
  options?: {
    minimum?: string;
    maximum?: string;
  };
};

export const FormTypeInputDateFormant = ({
  path,
  name,
  jsonSchema,
  readOnly,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<string, DateFormatJsonSchema>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
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
      max={max}
      min={min}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};
