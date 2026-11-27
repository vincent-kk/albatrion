import type { ReactElement } from 'react';
import { type ChangeEvent, useState } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import { readArrayItemTitleId } from '../../utils/readArrayItemTitleId';
import { readNativeTextValue } from '../../utils/readNativeTextValue';
import type { FieldInputDateFormatProps } from './type';
import { isRenderableDateInputValue } from './utils/isRenderableDateInputValue';

/** Render a native date, month, week, time or datetime-local input, falling back to text for an unrenderable default. */
export const FieldInputDateFormat = ({
  inputId: fieldId,
  labelId,
  node,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  misfit,
  onChange,
  style,
  className,
  minimum,
  maximum,
}: FieldInputDateFormatProps): ReactElement => {
  const [type] = useState(() =>
    isRenderableDateInputValue(jsonSchema.format, defaultValue)
      ? jsonSchema.format
      : 'text',
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.validity.badInput) return;
    onChange(readNativeTextValue(event.target.value));
  });
  return (
    <input
      type={type}
      id={fieldId}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      max={maximum}
      aria-labelledby={readArrayItemTitleId(node, labelId)}
      aria-invalid={misfit || undefined}
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
