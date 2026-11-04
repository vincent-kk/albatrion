import { type ReactNode, useMemo } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface FieldInputBooleanProps
  extends FieldInputProps<boolean | null, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FieldInputBoolean = ({
  path,
  name,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  misfit,
}: FieldInputBooleanProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [context, labelProp, name, sizeProp, hideLabel]);

  const [indeterminate, defaultChecked] = useMemo(() => {
    const isIndeterminate =
      defaultValue !== undefined && typeof defaultValue !== 'boolean';
    return [isIndeterminate, !!defaultValue];
  }, [defaultValue]);

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  // label이 없는 경우 Checkbox만 렌더링
  return (
    <FormControlLabel
      label={label}
      htmlFor={path}
      required={required}
      disabled={disabled}
      control={
        <Checkbox
          id={path}
          name={name}
          disabled={disabled}
          indeterminate={indeterminate}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          size={size}
          slotProps={{ input: { 'aria-invalid': misfit || undefined } }}
        />
      }
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  test: ({ type }) => type === 'boolean',
} satisfies FieldInputDefinition;
