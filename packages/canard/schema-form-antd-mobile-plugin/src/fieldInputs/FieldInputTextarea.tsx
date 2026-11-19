import { useMemo } from 'react';

import { TextArea } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';

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
  misfit,
  labelId: labelledBy,
}: FieldInputPropsWithSchema<string, TextareaSchema>) => {
  const bindControls = useControlIdentifiers(
    inputId,
    name,
    'textarea:not([aria-hidden="true"])',
  );
  const handleChange = useHandle((text: string) =>
    onChange(text === '' ? undefined : text),
  );
  const autoSize = useMemo(
    () => ({
      minRows: jsonSchema.minRows,
      maxRows: jsonSchema.maxRows,
    }),
    [jsonSchema],
  );
  return (
    <div
      ref={bindControls}
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : name}
      aria-invalid={misfit || undefined}
    >
      <TextArea
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
