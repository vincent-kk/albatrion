import { useMemo } from 'react';

import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const FieldInputBoolean = ({
  path,
  name,
  disabled,
  value,
  onChange,
  misfit,
}: FieldInputProps<boolean | null>) => {
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
      aria-invalid={misfit || undefined}
      id={path}
      name={name}
      disabled={disabled}
      indeterminate={indeterminate}
      checked={checked}
      onChange={handleChange}
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
