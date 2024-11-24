import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputNumber = ({
  name,
  readOnly,
  defaultValue,
  onChange,
}: FormTypeInputProps<number>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.valueAsNumber);
  });
  return (
    <input
      type="number"
      name={name}
      readOnly={readOnly}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};
