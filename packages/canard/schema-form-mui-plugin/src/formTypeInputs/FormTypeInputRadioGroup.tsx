import { useMemo } from 'react';

import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

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
  label,
  required,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
  row = true,
}: FormTypeInputRadioGroupProps) => {
  const options = useMemo(() => {
    const enumValues = jsonSchema.enum || [];
    const radioLabels = jsonSchema.radioLabels || enumValues.map(String);

    return enumValues.map((val, index) => ({
      value: String(val),
      originalValue: val,
      label: radioLabels[index] || String(val),
    }));
  }, [jsonSchema]);

  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      const selectedOption = options.find((opt) => opt.value === newValue);
      if (selectedOption) {
        onChange(selectedOption.originalValue);
      }
    },
  );

  return (
    <FormControlLabel
      label={label || name}
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
        <RadioGroup
          name={name}
          defaultValue={defaultValue}
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
                  size={size || context?.size}
                  id={`${path}-${option.value}`}
                />
              }
              label={option.label}
            />
          ))}
        </RadioGroup>
      }
    />
  );
};

export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    (formType === 'radio' || formType === 'radiogroup') &&
    jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
