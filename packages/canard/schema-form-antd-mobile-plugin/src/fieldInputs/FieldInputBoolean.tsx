import { Checkbox } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const FieldInputBoolean = ({
  inputId,
  labelId,
  disabled,
  readOnly,
  value,
  onChange,
  misfit,
  className,
  style,
}: FieldInputProps<boolean | null>) => {
  const handleChange = useHandle(onChange);
  return (
    <div
      className={className}
      style={style}
      role="group"
      aria-invalid={misfit || undefined}
    >
      <Checkbox
        aria-labelledby={labelId}
        id={inputId}
        disabled={disabled || readOnly}
        indeterminate={value !== undefined && typeof value !== 'boolean'}
        checked={value === true}
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
