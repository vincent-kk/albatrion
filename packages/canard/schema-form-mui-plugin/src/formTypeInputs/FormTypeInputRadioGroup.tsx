import { useEffect, useMemo, useState } from 'react';

import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

interface RadioGroupStringJsonSchema extends StringSchema {
  radioLabels?: string[];
  formType: 'radio';
}

interface RadioGroupNumberJsonSchema extends NumberSchema {
  radioLabels?: string[];
  formType: 'radio';
}

interface FormTypeInputRadioGroupProps
  extends FormTypeInputPropsWithSchema<
    string | number,
    RadioGroupStringJsonSchema | RadioGroupNumberJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  row?: boolean;
  label?: string;
}

const FormTypeInputRadioGroup = ({
  path,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
  row = true,
}: FormTypeInputRadioGroupProps) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const options = useMemo(() => {
    const enumValues = jsonSchema.enum || [];
    const radioLabels = jsonSchema.radioLabels || enumValues.map(String);

    return enumValues.map((val, index) => ({
      value: String(val),
      originalValue: val,
      label: radioLabels[index] || String(val),
    }));
  }, [jsonSchema]);

  // 외부 value가 변경될 때 내부 상태 동기화
  useEffect(() => {
    setSelectedValue(value !== undefined ? String(value) : '');
  }, [value]);

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setSelectedValue(newValue);

      const selectedOption = options.find((opt) => opt.value === newValue);
      if (selectedOption) {
        onChange(selectedOption.originalValue);
      }
    },
  );

  return (
    <Box>
      <RadioGroup
        name={name}
        value={selectedValue}
        onChange={handleChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            disabled={disabled}
            control={
              <Radio
                size={size || context?.size || 'medium'}
                id={`${path}-${option.value}`}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }) =>
    type === 'string' ||
    type === 'number' ||
    type === 'integer' ||
    (formType === 'radio' && jsonSchema.enum && jsonSchema.enum.length > 0),
} satisfies FormTypeInputDefinition;
