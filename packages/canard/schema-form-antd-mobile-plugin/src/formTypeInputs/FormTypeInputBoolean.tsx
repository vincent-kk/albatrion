import { useMemo } from 'react';

import { Checkbox } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

const FormTypeInputBoolean = ({
  path,
  disabled,
  value,
  onChange,
}: FormTypeInputProps<boolean>) => {
  const [indeterminate, checked] = useMemo(
    () => [value !== undefined && typeof value !== 'boolean', !!value],
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

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: {
    type: 'boolean',
  },
} satisfies FormTypeInputDefinition;
