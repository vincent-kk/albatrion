import { type ChangeEvent, useMemo } from 'react';

import { Input } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  format?: 'password';
  formType?: 'password';
}

interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<
    string,
    StringJsonSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputString = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputStringProps) => {
  const TextInput = useMemo(() => {
    if (jsonSchema.format === 'password' || jsonSchema.formType === 'password')
      return Input.Password;
    else return Input;
  }, [jsonSchema]);
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  return (
    <TextInput
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={jsonSchema.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: {
    type: 'string',
  },
} satisfies FormTypeInputDefinition;
