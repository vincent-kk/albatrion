import { type ChangeEvent, type ComponentPropsWithRef, useMemo } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

/** Render the common string input; binding wrappers may supply native draft handlers. */
export const FormTypeInputString = ({
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
}: FormTypeInputProps & {
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
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
