import { type ChangeEvent, useState } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputDateFormatProps } from './type';
import { isRenderableDateInputValue } from './utils/isRenderableDateInputValue';

/** Render a native date, month, week, time or datetime-local input, falling back to text for an unrenderable default. */
export const FieldInputDateFormat = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
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
    if (event.target.validity.badInput) return;
    onChange(event.target.value === '' ? undefined : event.target.value);
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
      onBlur={(event) => {
        if (event.target.validity.badInput)
          event.target.value = value == null ? '' : String(value);
      }}
      style={style}
      className={className}
    />
  );
};
