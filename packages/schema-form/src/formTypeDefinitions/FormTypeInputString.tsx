import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputString = ({
  name,
  defaultValue,
  onChange,
}: FormTypeInputProps<string>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  });
  return (
    <input
      type="text"
      name={name}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};
