import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputString = ({
  path,
  name,
  readOnly,
  defaultValue,
  onChange,
}: FormTypeInputProps<string>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  });
  return (
    <input
      type="text"
      id={path}
      name={name}
      readOnly={readOnly}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};
