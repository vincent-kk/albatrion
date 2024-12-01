import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputNumber = ({
  path,
  name,
  readOnly,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputProps<number>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.valueAsNumber);
  });
  return (
    <input
      type="number"
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};
