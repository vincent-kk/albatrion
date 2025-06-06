import { type ReactNode, useMemo } from 'react';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface StringEnumJsonSchema
  extends StringSchema<{ alias?: Record<string, string> }> {
  enum: string[];
}

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
      string,
      StringEnumJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FormTypeInputStringEnum = ({
  path,
  name,
  jsonSchema,
  required,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
}: FormTypeInputStringEnumProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

  const options = useMemo(
    () =>
      jsonSchema.enum.map((value) => ({
        value,
        label: jsonSchema.options?.alias?.[value] || value,
      })),
    [jsonSchema],
  );

  const handleChange = useHandle((event: any) => {
    onChange(event.target.value);
  });

  const labelId = useMemo(() => `label-${path}`, [path]);

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        id={path}
        name={name}
        labelId={labelId}
        label={label}
        required={required}
        readOnly={readOnly}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        size={size}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, jsonSchema }) =>
    type === 'string' && jsonSchema.enum && jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;
