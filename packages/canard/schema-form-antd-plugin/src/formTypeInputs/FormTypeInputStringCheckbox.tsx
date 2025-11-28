import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd';

import { map } from '@winglet/common-utils/array';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJsonSchema = StringSchema<{
  alias?: { [label: string]: ReactNode };
}>;

type ArrayJsonSchema = ArraySchema<{
  alias?: { [label: string]: ReactNode };
}> & {
  items: StringJsonSchema;
};

const FormTypeInputStringCheckbox = ({
  name,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  Array<string | null> | null,
  ArrayJsonSchema,
  { checkboxLabels?: { [label: string]: ReactNode } }
>) => {
  const options = useMemo(() => {
    const alias =
      context.checkboxLabels ||
      jsonSchema.items?.options?.alias ||
      jsonSchema.options?.alias ||
      {};
    return jsonSchema.items?.enum
      ? map(jsonSchema.items.enum, (rawValue: string | null) => {
          const value = '' + rawValue;
          return {
            value,
            rawValue,
            label: alias[value] || value,
          };
        })
      : [];
  }, [context, jsonSchema]);

  const handleChange = useHandle((value: string[]) => {
    const convertedValues = value
      .map((v) => options.find((opt) => opt.value === v)?.rawValue)
      .filter((v) => v !== undefined);
    onChange(convertedValues);
  });

  const initialValue = useMemo(() => {
    if (defaultValue == null) return undefined;
    return defaultValue.map((v) => '' + v);
  }, [defaultValue]);

  return (
    <Checkbox.Group
      name={name}
      style={{ display: 'flex' }}
      options={options}
      disabled={disabled}
      defaultValue={initialValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputStringCheckboxDefinition = {
  Component: FormTypeInputStringCheckbox,
  test: ({ type, formType, jsonSchema }) => {
    return (
      type === 'array' &&
      formType === 'checkbox' &&
      isStringSchema(jsonSchema.items) &&
      !!jsonSchema.items.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
