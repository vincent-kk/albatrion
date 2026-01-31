import { type ChangeEvent, useMemo } from 'react';

import { Input } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type TextareaSchema = StringSchema & {
  minRows?: number;
  maxRows?: number;
};

interface FormTypeInputTextareaProps
  extends FormTypeInputPropsWithSchema<
    string | null,
    TextareaSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputTextarea = ({
  path,
  name,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  placeholder,
  size,
}: FormTypeInputTextareaProps) => {
  const handleChange = useHandle((value: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(value.target.value);
  });
  const autoSize = useMemo(
    () => ({
      minRows: jsonSchema.minRows,
      maxRows: jsonSchema.maxRows,
    }),
    [jsonSchema],
  );
  return (
    <Input.TextArea
      id={path}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      autoSize={autoSize}
      placeholder={placeholder}
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'textarea' || formType === 'textarea'),
} satisfies FormTypeInputDefinition;
