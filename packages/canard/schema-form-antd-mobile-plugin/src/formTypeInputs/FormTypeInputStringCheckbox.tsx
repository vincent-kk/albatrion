import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';

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
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  Array<string | null>,
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

  const initialValue = useMemo(() => {
    if (defaultValue === undefined) return undefined;
    return map(defaultValue, (v) => '' + v);
  }, [defaultValue]);

  const handleChange = useHandle((value: CheckboxValue[]) => {
    const convertedValues = map(value, (v) => {
      const option = options.find((opt) => opt.value === v.toString());
      return option ? option.rawValue : v.toString();
    });
    onChange(convertedValues);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <Checkbox.Group
        disabled={disabled}
        defaultValue={initialValue}
        onChange={handleChange}
      >
        {map(options, (option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            style={{
              '--icon-size': '24px',
              '--font-size': '20px',
              '--gap': '6px',
            }}
          >
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
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
