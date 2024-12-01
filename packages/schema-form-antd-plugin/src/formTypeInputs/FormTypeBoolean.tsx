import { useMemo } from 'react';

import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-pack/schema-form';

const FormTypeBoolean = ({
  path,
  name,
  disabled,
  value,
  onChange,
}: FormTypeInputProps<boolean>) => {
  const [indeterminate, checked] = useMemo(
    () => [typeof value !== 'boolean', !!value],
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

export const FormTypeBooleanDefinition = {
  Component: FormTypeBoolean,
  test: {
    type: 'boolean',
  },
} satisfies FormTypeInputDefinition;
