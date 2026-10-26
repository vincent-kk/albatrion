import { type ChangeEvent, useLayoutEffect, useRef } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputProps } from '@/schema-form/types';

/** Render a boolean node as a checkbox; a non-boolean value shows as indeterminate. */
export const FieldInputBoolean = ({
  path,
  name,
  readOnly,
  disabled,
  misfit,
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
      checked={value === true}
      onChange={handleChange}
      style={style}
      className={className}
      aria-invalid={misfit || undefined}
    />
  );
};
