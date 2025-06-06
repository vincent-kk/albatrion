import { type ReactNode, useMemo } from 'react';

import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface StringCheckboxJsonSchema {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
    options?: {
      alias?: Record<string, string>;
    };
  };
  formType: 'checkbox';
}

interface FormTypeInputStringCheckboxProps
  extends FormTypeInputPropsWithSchema<
    string[],
    StringCheckboxJsonSchema,
    MuiContext
  >,
    MuiContext {
  label?: ReactNode;
  row?: boolean;
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
  size: sizeProp = 'medium',
  row = true,
}: FormTypeInputStringCheckboxProps) => {
  const [label, size] = useMemo(() => {
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
    ];
  }, [jsonSchema, context, labelProp, name, sizeProp]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.items.enum || [];
    const checkboxLabels = jsonSchema.items?.options?.alias;
    return enumValues.map((value) => ({
      value,
      label: checkboxLabels?.[value] || value,
    }));
  }, [jsonSchema]);

  const handleToggle = useHandle((optionValue: string) => {
    const currentValues = Array.isArray(defaultValue) ? defaultValue : [];
    const isSelected = currentValues.includes(optionValue);
    let newValues: string[];

    if (isSelected) {
      newValues = currentValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

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
            const isChecked = Array.isArray(defaultValue)
              ? defaultValue.includes(option.value)
              : false;
            return (
              <FormControlLabel
                key={option.value}
                disabled={disabled}
                control={
                  <Checkbox
                    id={`${path}-${option.value}`}
                    name={`${name}[]`}
                    defaultChecked={isChecked}
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
    jsonSchema.items?.type === 'string' &&
    jsonSchema.items?.enum &&
    jsonSchema.items.enum.length > 0,
} satisfies FormTypeInputDefinition;
