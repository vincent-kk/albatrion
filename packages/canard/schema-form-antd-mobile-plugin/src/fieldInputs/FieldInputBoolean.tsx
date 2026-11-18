import { useMemo } from 'react';

import { Checkbox } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const FieldInputBoolean = ({
  id,
  disabled,
  value,
  onChange,
  misfit,
}: FieldInputProps<boolean | null>) => {
  const [indeterminate, checked] = useMemo(
    () => [value !== undefined && typeof value !== 'boolean', value ?? false],
    [value],
  );
  const handleChange = useHandle(onChange);
  return (
    <div role="group" aria-invalid={misfit || undefined}>
      <Checkbox
        id={id}
        disabled={disabled}
        indeterminate={indeterminate}
        checked={checked}
        onChange={handleChange}
        style={{
          '--icon-size': '24px',
          '--font-size': '20px',
        }}
      />
    </div>
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  controlled: true,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
