import { type ReactNode, useMemo } from 'react';

import { Checkbox, FormControlLabel } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface FormTypeInputBooleanProps
  extends FormTypeInputProps<boolean, MuiContext>,
    MuiContext {
  label?: ReactNode;
}

const FormTypeInputBoolean = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
}: FormTypeInputBooleanProps) => {
  const [label, size] = useMemo(() => {
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

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
        />
      }
    />
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: ({ type }) => type === 'boolean',
} satisfies FormTypeInputDefinition;
