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
    alias?: { [label: string]: string };
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
  {
    size?: SizeType;
    enumLabels?: {
      [label: string]: string;
    };
  }
>) => {
  const [schema, alias, mode] = useMemo(() => {
    const alias =
      context.enumLabels ||
      jsonSchema.items?.options?.alias ||
      jsonSchema.options?.alias;
    if (jsonSchema.type === 'array')
      return [jsonSchema.items, alias, 'multiple'] as const;
    else return [jsonSchema, alias, undefined] as const;
  }, [context, jsonSchema]);

  const Options = useMemo(() => {
    return (
      schema.enum?.map((value, index) => (
        <Select.Option key={index + value} value={value}>
          {alias?.[value] || value}
        </Select.Option>
      )) || []
    );
  }, [alias, schema]);

  const handleChange = useHandle((value: string | string[]) => {
    onChange(value);
  });
  return (
    <Select
      id={path}
      mode={mode}
      placeholder={jsonSchema.placeholder}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      style={{ width: '100%' }}
      size={context?.size}
    >
      {Options}
    </Select>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, jsonSchema }) => {
    return (
      (type === 'string' && jsonSchema.enum?.length) ||
      (type === 'array' &&
        jsonSchema.items.type === 'string' &&
        jsonSchema.items.enum?.length)
    );
  },
} satisfies FormTypeInputDefinition;
