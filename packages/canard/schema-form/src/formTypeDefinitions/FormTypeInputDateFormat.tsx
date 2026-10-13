import { type ChangeEvent, useState } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

import { isRenderableDateInputValue } from './utils/isRenderableDateInputValue';

type DateFormatJSONSchema = {
  format: 'month' | 'week' | 'date' | 'date-time' | 'time';
} & StringSchema;

type FormTypeInputDateFormatProps = FormTypeInputPropsWithSchema<
  string | null,
  DateFormatJSONSchema
> & {
  /** Earliest allowed value, from `presentation.FormTypeInputProps.minimum`. */
  minimum?: string;
  /** Latest allowed value, from `presentation.FormTypeInputProps.maximum`. */
  maximum?: string;
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
  minimum,
  maximum,
}: FormTypeInputDateFormatProps) => {
  const [type] = useState(() =>
    isRenderableDateInputValue(jsonSchema.format, defaultValue)
      ? jsonSchema.format
      : 'text',
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
      max={maximum}
      min={minimum}
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
