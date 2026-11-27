import { useMemo } from 'react';

import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const FieldInputBoolean = ({
  inputId,
  name,
  disabled,
  readOnly,
  value,
  onChange,
  misfit,
  labelId,
  required,
  className,
  style,
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
      className={className}
      style={style}
      aria-labelledby={labelId}
      aria-required={required || undefined}
      aria-invalid={misfit || undefined}
      id={inputId}
      name={name}
      disabled={disabled || readOnly}
      indeterminate={indeterminate}
      checked={checked}
      onChange={handleChange}
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  controlled: true,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
