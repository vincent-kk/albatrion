import { useMemo } from 'react';

import { Checkbox } from 'antd-mobile';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-pack/schema-form';

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
  const handleChange = useHandle((event: boolean) => {
    onChange(event);
  });
  return (
    <Checkbox
      id={path}
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
