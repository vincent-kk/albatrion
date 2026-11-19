import { useMemo } from 'react';

import { Select } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { isArraySchema, isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { decodeEnumSelection } from './utils/enum/decodeEnumSelection';
import { filterEnumOption } from './utils/enum/filterEnumOption';
import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  id,
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
  const [schema, alias, mode] = useMemo(() => {
    const labels = context.enumLabels || aliasProp;
    if (isArraySchema(jsonSchema))
      return [jsonSchema.items as StringSchema, labels, 'multiple'] as const;
    else return [jsonSchema as StringSchema, labels, undefined] as const;
  }, [context, jsonSchema, aliasProp]);

  const options = useMemo(() => {
    return schema.enum
      ? map(schema.enum, (rawValue) => {
          const value = JSON.stringify(rawValue);
          return {
            value,
            rawValue,
            label: getOwnLabel(alias, '' + rawValue) || '' + rawValue,
          };
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
    if (isArray(defaultValue))
      return defaultValue.map((value) => JSON.stringify(value));
    // A null array value means no selection, not the null option.
    if (mode === 'multiple') return undefined;
    return defaultValue === null || typeof defaultValue === 'string'
      ? JSON.stringify(defaultValue)
      : undefined;
  }, [defaultValue, mode]);

  const handleChange = useHandle((value: string | string[]) => {
    if (Array.isArray(value)) {
      return onChange((previous) =>
        decodeEnumSelection(isArray(previous) ? previous : [], value, options),
      );
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
      id={id}
      mode={mode}
      filterOption={filterEnumOption}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      defaultValue={initialValue}
      onChange={handleChange}
      style={{ width: '100%' }}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
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
