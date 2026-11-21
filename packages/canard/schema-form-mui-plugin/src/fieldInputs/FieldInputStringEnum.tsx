import { type ReactNode, useMemo } from 'react';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';
import { getOwnLabel } from './utils/enum/getOwnLabel';

type StringEnumJSONSchema = StringSchema;

interface FieldInputStringEnumProps
  extends FieldInputPropsWithSchema<
      string | null,
      StringEnumJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: Record<string, string>;
  hideLabel?: boolean;
}

const FieldInputStringEnum = ({
  inputId,
  labelId: fieldTitleId,
  getInputId,
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
  misfit,
}: FieldInputStringEnumProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    jsonSchema,
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
        const value = JSON.stringify(rawValue);
        return {
          value,
          rawValue,
          label: getOwnLabel(alias, '' + rawValue) || '' + rawValue,
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

  const labelId = getInputId('label');

  const initialValue = useMemo(
    () =>
      options.find((option) => option.rawValue === defaultValue)?.value ?? '',
    [defaultValue, options],
  );

  return (
    <FormControl fullWidth={fullWidth} variant={variant} error={misfit}>
      <InputLabel id={labelId} htmlFor={getInputId('native')}>
        {label}
      </InputLabel>
      <Select
        id={inputId}
        inputProps={{ id: getInputId('native') }}
        SelectDisplayProps={{
          id: inputId,
          'aria-labelledby': fieldTitleId,
          'aria-label': fieldName,
        }}
        MenuProps={{ id: getInputId('menu') }}
        name={name}
        labelId={fieldTitleId}
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

export const FieldInputStringEnumDefinition = {
  Component: FieldInputStringEnum,
  test: ({ type, jsonSchema }) =>
    type === 'string' && !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
