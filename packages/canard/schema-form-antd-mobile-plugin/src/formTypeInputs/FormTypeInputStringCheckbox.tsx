import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';

import { map } from '@winglet/common-utils';
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
    alias?: { [label: string]: ReactNode };
  };
}

interface ArrayJsonSchema extends ArraySchema {
  items: StringJsonSchema;
}

const FormTypeInputStringCheckbox = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  Array<string>,
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
      ? map(jsonSchema.items.enum, (value: string) => ({
          label: alias[value] || value,
          value,
        }))
      : [];
  }, [context, jsonSchema]);

  const handleChange = useHandle((value: CheckboxValue[]) => {
    onChange(map(value, (v) => v.toString()));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <Checkbox.Group
        disabled={disabled}
        defaultValue={defaultValue}
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
      jsonSchema.items.type === 'string' &&
      jsonSchema.items.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
