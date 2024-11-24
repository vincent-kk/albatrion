import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputProps } from '@lumy/schema-form/types';

export const FormTypeInputBoolean = ({
  name,
  defaultValue,
  onChange,
}: FormTypeInputProps<boolean>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  });
  return (
    <input
      type="checkbox"
      name={name}
      defaultChecked={!!defaultValue}
      onChange={handleChange}
    />
  );
};
