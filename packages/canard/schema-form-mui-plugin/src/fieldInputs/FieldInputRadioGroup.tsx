import { type ReactNode, useMemo } from 'react';

import {
  FormControl,
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
import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  id,
  labelId = `input-label:${id}`,
  node,
  jsonSchema,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  alias,
  size: sizeProp = 'medium',
  row = true,
  hideLabel,
  misfit,
}: FieldInputRadioGroupProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || node.name, sizeProp || context.size];
  }, [context, labelProp, node.name, sizeProp, hideLabel]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.enum || [];
    const radioLabels = jsonSchema.radioLabels;

    return enumValues.map((rawValue, index) => {
      const value = JSON.stringify(rawValue);
      return {
        value,
        rawValue,
        label:
          radioLabels?.[index] ||
          getOwnLabel(alias, '' + rawValue) ||
          '' + rawValue,
      };
    });
  }, [jsonSchema, alias]);

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

  return (
    <FormControl
      component="fieldset"
      required={required}
      disabled={disabled || readOnly}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        border: 0,
        padding: 0,
        margin: 0,
      }}
    >
      <FormLabel component="legend" id={labelId}>
        {label}
      </FormLabel>
      <RadioGroup
        id={id}
        aria-labelledby={label ? labelId : undefined}
        name={id}
        defaultValue={initialValue}
        onChange={handleChange}
        row={row}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={option.value}
            htmlFor={`${id}-${index}`}
            value={option.value}
            disabled={disabled || readOnly}
            control={
              <Radio
                size={size}
                id={`${id}-${index}`}
                slotProps={{
                  input: { 'aria-invalid': misfit || undefined },
                }}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export const FieldInputRadioGroupDefinition = {
  Component: FieldInputRadioGroup,
  test: ({ schemaType: type, inputType, jsonSchema }) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
