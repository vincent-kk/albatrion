import { type ChangeEvent } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  nullable,
  onChange,
  placeholder,
  style,
  className,
}: FormTypeInputProps<number | null>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.validity.badInput) return;
    onChange(
      event.target.value === ''
        ? nullable
          ? null
          : undefined
        : event.target.valueAsNumber,
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

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: 'number' },
} satisfies FormTypeInputDefinition;
