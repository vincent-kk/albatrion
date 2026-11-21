import { type ReactNode, useMemo } from 'react';

import {
  Box,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getEnumOptions } from './utils/enum/getEnumOptions';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type RadioGroupStringJSONSchema = StringSchema & {
  radioLabels?: string[];
};

type RadioGroupNumberJSONSchema = NumberSchema & {
  radioLabels?: string[];
};

type FieldInputRadioGroupProps = {
  label?: ReactNode;
  alias?: { [label: string]: ReactNode };
  row?: boolean;
  hideLabel?: boolean;
} & MuiContext &
  FieldInputPropsWithSchema<
    string | number | null,
    RadioGroupStringJSONSchema | RadioGroupNumberJSONSchema,
    MuiContext
  >;

const FieldInputRadioGroup = ({
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  alias,
  size: sizeProp,
  row = true,
  hideLabel,
  misfit,
  className,
  style,
}: FieldInputRadioGroupProps) => {
  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

  const values: readonly (string | number | null)[] | undefined =
    jsonSchema.enum;
  const labels = jsonSchema.radioLabels;
  const options = useMemo(
    () => getEnumOptions(values, alias, getInputId, labels),
    [values, alias, getInputId, labels],
  );

  const initialValue = useMemo(
    () => options.find((option) => option.rawValue === defaultValue)?.value,
    [defaultValue, options],
  );

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const selectedOption = options.find((opt) => opt.value === newValue);
      if (selectedOption) {
        onChange(selectedOption.rawValue);
      }
    },
  );

  const captionId = label ? getInputId('legend') : undefined;
  const locked = disabled || readOnly;
  return (
    <Box
      className={className}
      style={style}
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
    >
      {label && (
        <FormLabel component="span" id={captionId} required={required}>
          {label}
        </FormLabel>
      )}
      <RadioGroup
        id={inputId}
        name={inputId}
        aria-labelledby={captionId ?? labelId}
        aria-invalid={misfit || undefined}
        defaultValue={initialValue}
        onChange={handleChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            disabled={locked}
            control={<Radio size={size} id={option.id} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export const FieldInputRadioGroupDefinition = {
  Component: FieldInputRadioGroup,
  test: ({ schemaType: type, inputType, jsonSchema }) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
