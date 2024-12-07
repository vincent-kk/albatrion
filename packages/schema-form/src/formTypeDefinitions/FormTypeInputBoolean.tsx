import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-form/types';

const FormTypeInputBoolean = ({
  path,
  name,
  readOnly,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputProps<boolean>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  });
  return (
    <input
      type="checkbox"
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      defaultChecked={!!defaultValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: { type: 'boolean' },
} satisfies FormTypeInputDefinition;
