import { useMemo } from 'react';

import { Checkbox } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const FieldInputBoolean = ({
  path,
  disabled,
  value,
  onChange,
}: FieldInputProps<boolean | null>) => {
  const [indeterminate, checked] = useMemo(
    () => [
      value !== undefined && typeof value !== 'boolean',
      value ?? undefined,
    ],
    [value],
  );
  const handleChange = useHandle(onChange);
  return (
    <Checkbox
      id={path}
      disabled={disabled}
      indeterminate={indeterminate}
      checked={checked}
      onChange={handleChange}
      style={{
        '--icon-size': '24px',
        '--font-size': '20px',
      }}
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
