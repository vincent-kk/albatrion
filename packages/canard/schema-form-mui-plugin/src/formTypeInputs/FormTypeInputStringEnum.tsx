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
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
}: FormTypeInputStringEnumProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    jsonSchema,
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

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
    <FormControl fullWidth={fullWidth} variant={variant}>
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
