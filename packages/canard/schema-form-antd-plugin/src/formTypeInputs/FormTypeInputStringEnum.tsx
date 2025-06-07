import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  enum?: string[];
  options?: {
    alias?: { [label: string]: string };
  };
}

interface ArrayJsonSchema extends ArraySchema {
  items: StringJsonSchema;
}

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
    string | Array<string>,
    StringJsonSchema | ArrayJsonSchema,
    { size?: SizeType; enumLabels?: { [label: string]: string } }
  > {
  size?: SizeType;
}

const FormTypeInputStringEnum = ({
  path,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputStringEnumProps) => {
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
    return schema.enum
      ? map(schema.enum, (value, index) => (
          <Select.Option key={index + value} value={value}>
            {alias?.[value] || value}
          </Select.Option>
        ))
      : [];
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
      size={size || context?.size}
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
