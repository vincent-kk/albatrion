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
  inputId,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder,
  minRows,
  maxRows,
  misfit,
  className,
  style,
}: FieldInputPropsWithSchema<string, TextareaSchema>) => {
  const handleChange = useHandle((text: string) =>
    onChange(text === '' ? undefined : text),
  );
  const autoSize = useMemo(
    () => ({
      minRows: minRows ?? jsonSchema.minRows,
      maxRows: maxRows ?? jsonSchema.maxRows,
    }),
    [minRows, maxRows, jsonSchema.minRows, jsonSchema.maxRows],
  );
  return (
    <div
      className={className}
      style={style}
      role="group"
      aria-invalid={misfit || undefined}
    >
      <TextArea
        id={inputId}
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
  );
};

export const FieldInputTextareaDefinition = {
  Component: FieldInputTextarea,
  test: ({ type, format, inputType }) =>
    type === 'string' && (format === 'textarea' || inputType === 'textarea'),
} satisfies FieldInputDefinition;
