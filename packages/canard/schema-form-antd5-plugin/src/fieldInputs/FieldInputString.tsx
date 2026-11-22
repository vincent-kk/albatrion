import { type ChangeEvent, useMemo } from 'react';

import { Input } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJSONSchema = StringSchema & {
  format?: 'password';
};

interface FieldInputStringProps
  extends FieldInputPropsWithSchema<
    string | null,
    StringJSONSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FieldInputString = ({
  inputId,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  placeholder,
  size,
  misfit,
  labelId,
  required,
  className,
  style,
}: FieldInputStringProps) => {
  const TextInput = useMemo(() => {
    if (
      jsonSchema.format === 'password' ||
      jsonSchema.presentation?.inputType === 'password'
    )
      return Input.Password;
    else return Input;
  }, [jsonSchema]);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    onChange(text === '' ? undefined : text);
  });
  return (
    <TextInput
      className={className}
      style={style}
      aria-labelledby={labelId}
      aria-required={required || undefined}
      id={inputId}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
      onChange={handleChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: {
    type: 'string',
  },
} satisfies FieldInputDefinition;
