import { useMemo } from 'react';

import { TextArea } from 'antd-mobile';

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

const FieldInputTextarea = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder,
  misfit,
}: FieldInputPropsWithSchema<string, TextareaSchema>) => {
  const handleChange = useHandle(onChange);
  const autoSize = useMemo(
    () => ({
      minRows: jsonSchema.minRows,
      maxRows: jsonSchema.maxRows,
    }),
    [jsonSchema],
  );
  return (
    <>
      <div role="group" aria-invalid={misfit || undefined}>
        <TextArea
          id={path}
          name={name}
          disabled={disabled}
          readOnly={readOnly}
          autoSize={autoSize}
          placeholder={placeholder}
          defaultValue={
            typeof defaultValue === 'string' ? defaultValue : undefined
          }
          onChange={handleChange}
        />
      </div>
      {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputTextareaDefinition = {
  Component: FieldInputTextarea,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'textarea' || inputType === 'textarea'),
} satisfies FieldInputDefinition;
