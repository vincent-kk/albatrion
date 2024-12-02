import { type ChangeEvent, useMemo } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@lumy/schema-form/types';

type DateFormatJsonSchema = {
  type: 'string';
  format: 'month' | 'week' | 'date' | 'date-time' | 'time';
  options?: {
    minimum?: string;
    maximum?: string;
  };
};

const FormTypeInputDateFormant = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
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
    />
  );
};

export const FormTypeInputDateFormantDefinition = {
  Component: FormTypeInputDateFormant,
  test: ({ jsonSchema }) =>
    jsonSchema.type === 'string' &&
    jsonSchema.format &&
    ['month', 'week', 'date', 'time', 'datetime-local'].includes(
      jsonSchema.format,
    ),
} satisfies FormTypeInputDefinition;
