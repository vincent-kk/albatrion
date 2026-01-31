import { useMemo } from 'react';

import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

const FormTypeInputBoolean = ({
  path,
  name,
  disabled,
  value,
  onChange,
}: FormTypeInputProps<boolean | null>) => {
  const [indeterminate, checked] = useMemo(
    () => [
      value !== undefined && typeof value !== 'boolean',
      value ?? undefined,
    ],
    [value],
  );
  const handleChange = useHandle((event: CheckboxChangeEvent) => {
    onChange(!!event.target.checked);
  });
  return (
    <Checkbox
      id={path}
      name={name}
      disabled={disabled}
      indeterminate={indeterminate}
      checked={checked}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: {
    type: 'boolean',
  },
} satisfies FormTypeInputDefinition;
