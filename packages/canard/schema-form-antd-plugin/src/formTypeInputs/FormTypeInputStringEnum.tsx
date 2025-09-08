import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJsonSchema = StringSchema<{
  alias?: { [label: string]: string };
}>;

type ArrayJsonSchema = ArraySchema<{
  alias?: { [label: string]: string };
}> & {
  items: StringJsonSchema;
};

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
    (string | null) | Array<string | null>,
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

  const options = useMemo(() => {
    return schema.enum
      ? map(schema.enum, (rawValue) => {
          const value = '' + rawValue;
          return { value, rawValue, label: alias?.['' + value] || value };
        })
      : [];
  }, [alias, schema]);

  const Options = useMemo(() => {
    return map(options, ({ value, label }, index) => {
      return (
        <Select.Option key={index + value} value={value}>
          {label}
        </Select.Option>
      );
    });
  }, [options]);

  const handleChange = useHandle((value: string | string[]) => {
    if (Array.isArray(value)) {
      const rawValues = value
        .map((v) => options.find((option) => option.value === v)?.rawValue)
        .filter((v) => v !== undefined);
      return onChange(rawValues);
    } else {
      const rawValue = options.find(
        (option) => option.value === value,
      )?.rawValue;
      if (rawValue === undefined) return;
      onChange(rawValue);
    }
  });

  const stringifiedDefaultValue = useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (Array.isArray(defaultValue)) return defaultValue.map((v) => '' + v);
    else return '' + defaultValue;
  }, [defaultValue]);

  return (
    <Select
      id={path}
      mode={mode}
      placeholder={jsonSchema.placeholder}
      disabled={disabled}
      defaultValue={stringifiedDefaultValue}
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
