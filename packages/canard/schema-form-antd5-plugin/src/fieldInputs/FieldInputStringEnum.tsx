import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { isArray } from '@winglet/common-utils/filter';
import { isArraySchema, isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { getEnumOptions } from './utils/enum/getEnumOptions';

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
  inputId,
  labelId,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  alias: aliasProp,
  placeholder,
  size,
  misfit,
}: FieldInputStringEnumProps) => {
  const multiple = isArraySchema(jsonSchema);
  const schema = multiple ? jsonSchema.items : jsonSchema;
  const values = schema && isStringSchema(schema) ? schema.enum : undefined;
  const labels = context.enumLabels || aliasProp;
  const options = useMemo(
    () => getEnumOptions(values, labels),
    [values, labels],
  );
  const initialValue = useMemo(() => {
    if (multiple)
      return isArray(defaultValue)
        ? defaultValue.map((value) => JSON.stringify(value))
        : [];
    return defaultValue === null || typeof defaultValue === 'string'
      ? JSON.stringify(defaultValue)
      : undefined;
  }, [defaultValue, multiple]);

  const handleChange = useHandle((value: string | string[]) => {
    onChange(
      isArray(value)
        ? value.map((token) => JSON.parse(token))
        : JSON.parse(value),
    );
  });

  return (
    <Select
      id={inputId}
      aria-labelledby={labelId}
      mode={multiple ? 'multiple' : undefined}
      options={options}
      optionFilterProp="label"
      placeholder={placeholder}
      disabled={disabled || readOnly}
      defaultValue={initialValue}
      onChange={handleChange}
      style={{ width: '100%' }}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
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
