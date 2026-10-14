import { type ChangeEvent, useLayoutEffect, useRef } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

const FieldInputBoolean = ({
  path,
  name,
  readOnly,
  disabled,
  defaultValue,
  value,
  onChange,
  style,
  className,
}: FieldInputProps<boolean | null>) => {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.indeterminate = typeof value !== 'boolean';
  }, [value]);
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  });
  return (
    <input
      ref={ref}
      type="checkbox"
      id={path}
      name={name}
      disabled={disabled || readOnly}
      defaultChecked={defaultValue === true}
      onChange={handleChange}
      style={style}
      className={className}
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  test: { type: 'boolean' },
} satisfies FieldInputDefinition;
