import { useMemo } from 'react';

import { TextArea } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface TextareaSchema extends StringSchema {
  minRows?: number;
  maxRows?: number;
}

const FormTypeInputTextarea = ({
  path,
  name,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<string, TextareaSchema>) => {
  const handleChange = useHandle((value: string) => {
    onChange(value);
  });
  const autoSize = useMemo(
    () => ({
      minRows: jsonSchema.minRows,
      maxRows: jsonSchema.maxRows,
    }),
    [jsonSchema],
  );
  return (
    <TextArea
      id={path}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      autoSize={autoSize}
      placeholder={jsonSchema.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: ({ type, format, formType }) =>
    type === 'string' && (format === 'textarea' || formType === 'textarea'),
} satisfies FormTypeInputDefinition;
