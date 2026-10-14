import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { isArraySchema, isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type ArrayJSONSchema = ArraySchema & {
  items: StringSchema;
};

interface FieldInputStringEnumProps
  extends FieldInputPropsWithSchema<
    (string | null) | Array<string | null>,
    StringSchema | ArrayJSONSchema,
    { size?: SizeType; enumLabels?: { [label: string]: string } }
  > {
  size?: SizeType;
  alias?: { [label: string]: string };
}

const FieldInputStringEnum = ({
  path,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  alias: aliasProp,
  placeholder,
  size,
}: FieldInputStringEnumProps) => {
  const [schema, alias, mode] = useMemo(() => {
    const labels = context.enumLabels || aliasProp;
    if (isArraySchema(jsonSchema))
      return [jsonSchema.items as StringSchema, labels, 'multiple'] as const;
    else return [jsonSchema as StringSchema, labels, undefined] as const;
  }, [context, jsonSchema, aliasProp]);

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

  const initialValue = useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (Array.isArray(defaultValue)) return defaultValue.map((v) => '' + v);
    else return '' + defaultValue;
  }, [defaultValue]);

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

  return (
    <Select
      id={path}
      mode={mode}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={initialValue}
      onChange={handleChange}
      style={{ width: '100%' }}
      size={size || context?.size}
    >
      {Options}
    </Select>
  );
};

export const FieldInputStringEnumDefinition = {
  Component: FieldInputStringEnum,
  test: ({ type, jsonSchema }) => {
    return (
      (type === 'string' && !!jsonSchema.enum?.length) ||
      (type === 'array' &&
        isStringSchema(jsonSchema.items) &&
        !!jsonSchema.items.enum?.length)
    );
  },
} satisfies FieldInputDefinition;
