import { type ChangeEvent, useState } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

import { isRenderableDateInputValue } from './utils/isRenderableDateInputValue';

type DateFormatJSONSchema = {
  format: 'month' | 'week' | 'date' | 'datetime-local' | 'time';
} & StringSchema;

type FieldInputDateFormatProps = FieldInputPropsWithSchema<
  string | null,
  DateFormatJSONSchema
> & {
  /** Earliest allowed value, from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest allowed value, from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
};

const FieldInputDateFormat = ({
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
}: FieldInputDateFormatProps) => {
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

export const FieldInputDateFormatDefinition = {
  Component: FieldInputDateFormat,
  test: {
    type: 'string',
    format: ['month', 'week', 'date', 'time', 'datetime-local'],
  },
} satisfies FieldInputDefinition;
