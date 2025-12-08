import { Input } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJsonSchema = StringSchema & {
  format?: 'password';
  formType?: 'password';
};

const FormTypeInputString = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  placeholder,
}: FormTypeInputPropsWithSchema<string | null, StringJsonSchema>) => {
  const type = jsonSchema.format === 'password' ? 'password' : 'text';
  const handleChange = useHandle(onChange);
  return (
    <Input
      id={path}
      name={name}
      type={type}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      defaultValue={defaultValue ?? undefined}
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
