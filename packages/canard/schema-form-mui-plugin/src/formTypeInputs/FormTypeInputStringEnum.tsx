import { useMemo } from 'react';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringEnumJsonSchema
  extends StringSchema<{ alias?: Record<string, string> }> {
  enum: string[];
}

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringEnumJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
}

const FormTypeInputStringEnum = ({
  path,
  name,
  label,
  required,
  readOnly,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputStringEnumProps) => {
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
      <InputLabel id={labelId}>{label || name}</InputLabel>
      <Select
        id={path}
        name={name}
        labelId={labelId}
        label={label || name}
        required={required}
        readOnly={readOnly}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        size={size || context?.size}
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
