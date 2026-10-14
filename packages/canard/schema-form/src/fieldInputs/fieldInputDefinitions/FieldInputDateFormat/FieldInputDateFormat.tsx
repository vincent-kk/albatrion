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
