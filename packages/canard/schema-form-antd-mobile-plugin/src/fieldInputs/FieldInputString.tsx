import { Input } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useNativeFieldName } from '../utils/useNativeFieldName';
import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';

type StringJSONSchema = StringSchema & {
  format?: 'password';
};

const FieldInputString = ({
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
}: FieldInputPropsWithSchema<string | null, StringJSONSchema>) => {
  const fieldName = useFieldNameFallback(jsonSchema, name);
  const naming = useNativeFieldName(inputId, labelledBy, fieldName);
  const bindControls = useControlIdentifiers(
    inputId,
    name,
    'input',
    undefined,
    undefined,
    naming,
  );
  const type = jsonSchema.format === 'password' ? 'password' : 'text';
  const handleChange = useHandle((text: string) =>
    onChange(text === '' ? undefined : text),
  );
  return (
    <div
      ref={bindControls}
      role="group"
      aria-labelledby={labelledBy}
      aria-label={fieldName}
      aria-invalid={misfit || undefined}
    >
      <Input
        id={inputId}
        aria-label={naming['aria-label']}
        name={name}
        type={type}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={
          typeof defaultValue === 'string' ? defaultValue : undefined
        }
        onChange={handleChange}
      />
    </div>
  );
};

export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: {
    type: 'string',
  },
} satisfies FieldInputDefinition;
