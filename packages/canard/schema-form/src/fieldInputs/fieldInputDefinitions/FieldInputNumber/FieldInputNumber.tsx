import { type ChangeEvent } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputProps } from '@/schema-form/types';

/** Render a number input whose empty field writes undefined and whose bad input stays a draft. */
export const FieldInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  misfit,
  onChange,
  placeholder,
  style,
  className,
}: FieldInputProps<number | null>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.validity.badInput) return;
    onChange(
      event.target.value === '' ? undefined : event.target.valueAsNumber,
    );
  });
  return (
    <input
      type="number"
      id={path}
      name={name}
      step={jsonSchema.multipleOf}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      aria-invalid={misfit || undefined}
      defaultValue={
        defaultValue == null ||
        (typeof defaultValue === 'number' && !Number.isFinite(defaultValue))
          ? undefined
          : defaultValue
      }
      onChange={handleChange}
      onBlur={(event) => {
        if (event.target.validity.badInput)
          event.target.value =
            value == null ||
            (typeof value === 'number' && !Number.isFinite(value))
              ? ''
              : String(value);
      }}
      style={style}
      className={className}
    />
  );
};
