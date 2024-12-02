import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@lumy-pack/common-react';
import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@lumy-pack/schema-form';

interface StringJsonSchema extends StringSchema {
  enum?: string[];
  options?: {
    alias?: Dictionary<string>;
  };
}

interface ArrayJsonSchema extends ArraySchema {
  items: StringJsonSchema;
}

const FormTypeInputStringEnum = ({
  path,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  string | Array<string>,
  StringJsonSchema | ArrayJsonSchema,
  { size?: SizeType }
>) => {
  const [schema, mode] = useMemo(() => {
    if (jsonSchema.type === 'array')
      return [jsonSchema.items, 'multiple'] as const;
    return [jsonSchema, undefined] as const;
  }, [jsonSchema]);

  const Options = useMemo(() => {
    const alias = schema.options?.alias || {};
    return (
      schema.enum?.map((value, index) => (
        <Select.Option key={index + value} value={value}>
          {alias[value] || value}
        </Select.Option>
      )) || []
    );
  }, [schema]);

  const handleChange = useHandle((value: string | string[]) => {
    onChange(value);
  });
  return (
    <Select
      id={path}
      mode={mode}
      disabled={disabled}
      defaultValue={defaultValue}
      options={Options}
      onChange={handleChange}
      size={context?.size}
    >
      {Options}
    </Select>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, formType, jsonSchema }) => {
    return (
      (type === 'string' && formType === 'select' && jsonSchema.enum?.length) ||
      (type === 'array' &&
        formType === 'select' &&
        jsonSchema.items.type === 'string' &&
        jsonSchema.items.enum?.length)
    );
  },
} satisfies FormTypeInputDefinition;
