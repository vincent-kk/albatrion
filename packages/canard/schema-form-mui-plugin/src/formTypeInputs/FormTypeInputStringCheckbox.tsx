import { useEffect, useMemo, useState } from 'react';

import { Box, Checkbox, FormControlLabel, FormGroup } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

interface StringCheckboxJsonSchema {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
  };
  formType: 'checkbox';
  checkboxLabels?: string[];
}

interface FormTypeInputStringCheckboxProps
  extends FormTypeInputPropsWithSchema<
    string[],
    StringCheckboxJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  row?: boolean;
  label?: string;
}

const FormTypeInputStringCheckbox = ({
  path,
  name,
  jsonSchema,
  disabled,
  value = [],
  onChange,
  context,
  size,
  row = true,
}: FormTypeInputStringCheckboxProps) => {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.items.enum || [];
    const checkboxLabels = jsonSchema.checkboxLabels || enumValues;

    return enumValues.map((val, index) => ({
      value: val,
      label: checkboxLabels[index] || val,
    }));
  }, [jsonSchema]);

  // 외부 value가 변경될 때 내부 상태 동기화
  useEffect(() => {
    setCheckedValues(Array.isArray(value) ? value : []);
  }, [value]);

  const handleToggle = useHandle((optionValue: string) => {
    const isSelected = checkedValues.includes(optionValue);
    let newValues: string[];

    if (isSelected) {
      newValues = checkedValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...checkedValues, optionValue];
    }

    setCheckedValues(newValues);
    onChange(newValues);
  });

  return (
    <Box>
      <FormGroup row={row}>
        {options.map((option) => {
          const isChecked = checkedValues.includes(option.value);

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
                  size={size || context?.size || 'medium'}
                />
              }
              label={option.label}
            />
          );
        })}
      </FormGroup>
    </Box>
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
