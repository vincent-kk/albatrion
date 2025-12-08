import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { TextField } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type NumberJsonSchema = NumberSchema;

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<
      number | null,
      NumberJsonSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
}

const FormTypeInputNumber = ({
  type,
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
  placeholder,
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
      labelProp || name,
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
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

    // 빈 문자열인 경우 null로 처리
    if (inputValue === '') {
      onChange(null);
      return;
    }

    // 숫자로 변환
    const numericValue =
      type === 'integer' ? parseInt(inputValue, 10) : parseFloat(inputValue);

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
      placeholder={placeholder}
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
      disabled={disabled}
      slotProps={{
        input: {
          readOnly,
          inputProps: {
            min: jsonSchema.minimum,
            max: jsonSchema.maximum,
            step: jsonSchema.multipleOf || (type === 'integer' ? 1 : 'any'),
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
