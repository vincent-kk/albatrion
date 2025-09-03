import { type ReactNode, useMemo } from 'react';

import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type RadioGroupStringJsonSchema = StringSchema & {
  radioLabels?: string[];
  formType: 'radio';
};

type RadioGroupNumberJsonSchema = NumberSchema & {
  radioLabels?: string[];
  formType: 'radio';
};

type FormTypeInputRadioGroupProps = {
  label?: ReactNode;
  row?: boolean;
  hideLabel?: boolean;
} & MuiContext &
  FormTypeInputPropsWithSchema<
    string | number | null,
    RadioGroupStringJsonSchema | RadioGroupNumberJsonSchema,
    MuiContext
  >;

const FormTypeInputRadioGroup = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  row = true,
  hideLabel,
}: FormTypeInputRadioGroupProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp, hideLabel]);

  const options = useMemo(() => {
    const enumValues = jsonSchema.enum || [];
    const radioLabels =
      jsonSchema.radioLabels || enumValues.map((value) => '' + value);

    return enumValues.map((val, index) => ({
      value: '' + val,
      originalValue: val,
      label: radioLabels[index] || '' + val,
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
              control={<Radio size={size} id={`${path}-${option.value}`} />}
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
    !!jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
