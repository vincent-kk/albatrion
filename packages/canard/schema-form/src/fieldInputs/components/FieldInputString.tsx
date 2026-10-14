import { type ChangeEvent, type ComponentPropsWithRef, useMemo } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

/** Render the common string input; binding wrappers may supply native draft handlers. */
export const FieldInputString = ({
  path,
  name,
  readOnly,
  disabled,
  jsonSchema,
  defaultValue,
  nullable,
  onChange,
  placeholder,
  style,
  className,
  inputProps,
}: FieldInputProps & {
  inputProps?: ComponentPropsWithRef<'input'>;
}) => {
  const type = useMemo(() => {
    if (jsonSchema?.format === 'password') return 'password';
    else if (jsonSchema?.format === 'email') return 'email';
    else return 'text';
  }, [jsonSchema?.format]);
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(
      event.target.value === ''
        ? nullable
          ? null
          : undefined
        : event.target.value,
    );
  });
  return (
    <input
      type={type}
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
      style={style}
      className={className}
      {...inputProps}
    />
  );
};

/** Match the ordinary string fallback after more specific definitions. */
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },
} satisfies FieldInputDefinition;
