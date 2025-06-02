import { useMemo } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

interface FormTypeInputBooleanProps extends FormTypeInputProps<boolean> {
  label?: string;
  size?: 'small' | 'medium';
}

const FormTypeInputBoolean = ({
  path,
  name,
  required,
  disabled,
  value,
  onChange,
  label,
  size = 'medium',
}: FormTypeInputBooleanProps) => {
  const [indeterminate, checked] = useMemo(() => {
    // value가 undefined이거나 boolean이 아닌 경우 indeterminate
    const isIndeterminate = value !== undefined && typeof value !== 'boolean';
    return [isIndeterminate, !!value];
  }, [value]);

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  // label이 없는 경우 Checkbox만 렌더링
  return (
    <FormControlLabel
      label={label || name}
      htmlFor={path}
      required={required}
      disabled={disabled}
      control={
        <Checkbox
          id={path}
          name={name}
          disabled={disabled}
          indeterminate={indeterminate}
          checked={checked}
          onChange={handleChange}
          size={size}
        />
      }
    />
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: ({ type }) => type === 'boolean',
} satisfies FormTypeInputDefinition;
