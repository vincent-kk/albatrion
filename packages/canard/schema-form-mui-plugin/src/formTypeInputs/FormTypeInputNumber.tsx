import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

interface NumberJsonSchema extends NumberSchema {
  placeholder?: string;
}

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<number, NumberJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  required,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
}: FormTypeInputNumberProps) => {
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      labelProp || jsonSchema.label || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    jsonSchema,
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

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
      variant={variant}
      fullWidth={fullWidth}
      label={label}
      required={required}
      size={size}
      placeholder={jsonSchema.placeholder}
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
