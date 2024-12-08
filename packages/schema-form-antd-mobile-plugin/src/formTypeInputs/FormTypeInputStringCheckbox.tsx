import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';

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
    return (
      jsonSchema.items?.enum?.map((value: string) => ({
        label: alias[value] || value,
        value,
      })) || []
    );
  }, [context, jsonSchema]);

  const handleChange = useHandle((value: CheckboxValue[]) => {
    onChange(value.map((v) => v.toString()));
  });

  return (
    <Checkbox.Group
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
    >
      {options.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </Checkbox.Group>
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
