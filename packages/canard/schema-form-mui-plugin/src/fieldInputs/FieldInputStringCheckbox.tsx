import { type ReactNode, useMemo, useState } from 'react';

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@mui/material';

import { isArray } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { getOwnLabel } from './utils/enum/getOwnLabel';

type StringCheckboxJSONSchema = ArraySchema & {
  type: 'array';
  items: StringSchema;
};

interface FieldInputStringCheckboxProps
  extends FieldInputPropsWithSchema<
      Array<string | null>,
      StringCheckboxJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: Record<string, string>;
  row?: boolean;
  hideLabel?: boolean;
}

const FieldInputStringCheckbox = ({
  id,
  labelId = `input-label:${id}`,
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
  size: sizeProp = 'medium',
  row = true,
  hideLabel,
  misfit,
}: FieldInputStringCheckboxProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [hideLabel, sizeProp, context.size, labelProp, name]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.items.enum || [];
    return enumValues.map((rawValue) => {
      const value = JSON.stringify(rawValue);
      return {
        value,
        rawValue,
        label: getOwnLabel(alias, '' + rawValue) || '' + rawValue,
      };
    });
  }, [jsonSchema, alias]);

  const [value, setValue] = useState<string[]>(() =>
    isArray(defaultValue) &&
    defaultValue.every((v) => v === null || typeof v === 'string')
      ? defaultValue.map((v) => JSON.stringify(v))
      : [],
  );

  const handleToggle = useHandle((optionValue: string) => {
    const currentValues = value;
    const isSelected = currentValues.includes(optionValue);
    let newValues: string[];

    if (isSelected) {
      newValues = currentValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    setValue(newValues);
    onChange(
      newValues
        .map(
          (token) => options.find((option) => option.value === token)?.rawValue,
        )
        .filter((rawValue) => rawValue !== undefined),
    );
  });

  return (
    <FormControl
      component="fieldset"
      role="group"
      id={id}
      aria-labelledby={label ? labelId : undefined}
      aria-invalid={misfit || undefined}
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
      <FormGroup row={row}>
        {options.map((option, index) => {
          const isChecked = value.includes(option.value);
          return (
            <FormControlLabel
              key={option.value}
              htmlFor={`${id}-${index}`}
              disabled={disabled || readOnly}
              control={
                <Checkbox
                  id={`${id}-${index}`}
                  name={`${name}[]`}
                  checked={isChecked}
                  onChange={() => handleToggle(option.value)}
                  size={size}
                />
              }
              label={option.label}
            />
          );
        })}
      </FormGroup>
    </FormControl>
  );
};

export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  test: isCheckboxGroupInput,
} satisfies FieldInputDefinition;
