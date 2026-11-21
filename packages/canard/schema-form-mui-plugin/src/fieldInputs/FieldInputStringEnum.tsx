import { type ReactNode, useMemo } from 'react';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getEnumOptions } from './utils/enum/getEnumOptions';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

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
  focusRef,
  labelId,
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
  className,
  style,
}: FieldInputStringEnumProps) => {
  const [label, size, variant, fullWidth] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp, variant: variantProp, fullWidth: fullWidthProp },
    context,
  );

  const values = jsonSchema.enum;
  const options = useMemo(() => getEnumOptions(values, alias), [values, alias]);
  const initialValue =
    options.find(({ rawValue }) => rawValue === defaultValue)?.value ?? '';
  const ownLabelId = label ? getInputId('legend') : undefined;
  const handleChange = useHandle((event: SelectChangeEvent<string>) => {
    const selected = options.find(({ value }) => value === event.target.value);
    if (selected) onChange(selected.rawValue);
  });

  return (
    <FormControl
      className={className}
      style={style}
      fullWidth={fullWidth}
      variant={variant}
      error={misfit}
    >
      {label && <InputLabel id={ownLabelId}>{label}</InputLabel>}
      <Select
        inputRef={disabled ? undefined : focusRef}
        SelectDisplayProps={{
          id: inputId,
          'aria-labelledby': ownLabelId ?? labelId,
        }}
        name={name}
        labelId={ownLabelId}
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
