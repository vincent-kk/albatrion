import { type ChangeEvent } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface NumberJsonSchema extends NumberSchema {
  placeholder?: string;
}

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<
    number,
    NumberJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
}

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  value,
  onChange,
  context,
  size,
}: FormTypeInputNumberProps) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // 빈 문자열인 경우 undefined로 처리
    if (inputValue === '') {
      onChange(NaN);
      return;
    }

    // 숫자로 변환
    const numericValue =
      jsonSchema.type === 'integer'
        ? parseInt(inputValue, 10)
        : parseFloat(inputValue);

    // 유효한 숫자인지 확인
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  });

  return (
    <TextField
      id={path}
      name={name}
      type="number"
      variant="outlined"
      fullWidth
      size={size || context?.size || 'medium'}
      placeholder={jsonSchema.placeholder}
      value={value ?? ''}
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={disabled}
      slotProps={{
        input: {
          readOnly,
          inputProps: {
            min: jsonSchema.minimum,
            max: jsonSchema.maximum,
            step:
              jsonSchema.multipleOf ||
              (jsonSchema.type === 'integer' ? 1 : 'any'),
          },
        },
      }}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: {
    type: ['number', 'integer'],
  },
} satisfies FormTypeInputDefinition;
