import type { ChangeEvent } from 'react';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputString = ({
  path,
  name,
  readOnly,
  disabled,
  jsonSchema,
  defaultValue,
  onChange,
  style,
  className,
}: FormTypeInputProps<string>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  return (
    <input
      type="text"
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={jsonSchema?.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      style={style}
      className={className}
    />
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
