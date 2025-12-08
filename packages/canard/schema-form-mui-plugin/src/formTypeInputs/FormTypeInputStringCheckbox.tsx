import { type ReactNode, useMemo, useState } from 'react';

import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type StringCheckboxJsonSchema = ArraySchema & {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
    nullable: false;
  };
  formType: 'checkbox';
};

interface FormTypeInputStringCheckboxProps
  extends FormTypeInputPropsWithSchema<
      string[],
      StringCheckboxJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: Record<string, string>;
  row?: boolean;
  hideLabel?: boolean;
}

const FormTypeInputStringCheckbox = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue = [],
  onChange,
  context,
  label: labelProp,
  alias,
  size: sizeProp = 'medium',
  row = true,
  hideLabel,
}: FormTypeInputStringCheckboxProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [hideLabel, sizeProp, context.size, labelProp, name]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.items.enum || [];
    return enumValues.map((rawValue) => {
      const value = '' + rawValue;
      return {
        value,
        rawValue,
        label: alias?.[value] || value,
      };
    });
  }, [jsonSchema, alias]);

  const [value, setValue] = useState<string[]>(defaultValue.map((v) => '' + v));

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
    onChange(newValues);
  });

  return (
    <FormControlLabel
      label={label}
      htmlFor={path}
      required={required}
      disabled={disabled}
      labelPlacement="start"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: 8,
      }}
      control={
        <FormGroup row={row}>
          {options.map((option) => {
            const isChecked = value.includes(option.value);
            return (
              <FormControlLabel
                key={option.value}
                disabled={disabled}
                control={
                  <Checkbox
                    id={`${path}-${option.value}`}
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
      }
    />
  );
};

export const FormTypeInputStringCheckboxDefinition = {
  Component: FormTypeInputStringCheckbox,
  test: ({ type, formType, jsonSchema }) =>
    type === 'array' &&
    formType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length,
} satisfies FormTypeInputDefinition;
