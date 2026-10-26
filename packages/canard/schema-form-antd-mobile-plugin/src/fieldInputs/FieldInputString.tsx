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
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder,
  misfit,
}: FieldInputPropsWithSchema<string | null, StringJSONSchema>) => {
  const type = jsonSchema.format === 'password' ? 'password' : 'text';
  const handleChange = useHandle(onChange);
  return (
    <>
      <div role="group" aria-invalid={misfit || undefined}>
        <Input
          id={path}
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
      {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: {
    type: 'string',
  },
} satisfies FieldInputDefinition;
