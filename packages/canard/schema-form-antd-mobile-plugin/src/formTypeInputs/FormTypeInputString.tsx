import { Input } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  format?: 'password';
  formType?: 'password';
}

const FormTypeInputString = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<string, StringJsonSchema>) => {
  const type = jsonSchema.format === 'password' ? 'password' : 'text';
  const handleChange = useHandle(onChange);
  return (
    <Input
      id={path}
      name={name}
      type={type}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={jsonSchema.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: {
    type: 'string',
  },
} satisfies FormTypeInputDefinition;
