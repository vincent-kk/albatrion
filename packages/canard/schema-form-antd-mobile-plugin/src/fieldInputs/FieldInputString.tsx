import { Input } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJSONSchema = StringSchema & {
  format?: 'password';
};

const FieldInputString = ({
  id,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputPropsWithSchema<string | null, StringJSONSchema>) => {
  const type = jsonSchema.format === 'password' ? 'password' : 'text';
  const handleChange = useHandle((text: string) =>
    onChange(text === '' ? undefined : text),
  );
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : name}
      aria-invalid={misfit || undefined}
    >
      <Input
        id={id}
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
