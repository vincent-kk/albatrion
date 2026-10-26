import { type ChangeEvent, useMemo } from 'react';

import { Input } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type TextareaSchema = StringSchema & {
  minRows?: number;
  maxRows?: number;
};

interface FieldInputTextareaProps
  extends FieldInputPropsWithSchema<
    string | null,
    TextareaSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FieldInputTextarea = ({
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
  misfit,
}: FieldInputTextareaProps) => {
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
      defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
      onChange={handleChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputTextareaDefinition = {
  Component: FieldInputTextarea,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'textarea' || inputType === 'textarea'),
} satisfies FieldInputDefinition;
