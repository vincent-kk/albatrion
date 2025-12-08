import { type ReactNode, useMemo } from 'react';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type StringEnumJsonSchema = StringSchema;

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
      string | null,
      StringEnumJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: Record<string, string>;
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
  alias,
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
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
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
      jsonSchema.enum?.map((rawValue) => {
        const value = '' + rawValue;
        return {
          value,
          rawValue,
          label: alias?.[value] || value,
        };
      }) || [],
    [jsonSchema, alias],
  );

  const handleChange = useHandle((event: any) => {
    const rawValue = options.find(
      (option) => option.value === event.target.value,
    )?.rawValue;
    if (rawValue === undefined) return;
    onChange(rawValue);
  });

  const labelId = useMemo(() => `label-${path}`, [path]);

  const initialValue = useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (defaultValue === null) return '' + null;
    return defaultValue;
  }, [defaultValue]);

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
        defaultValue={initialValue}
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
    type === 'string' && !!jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
