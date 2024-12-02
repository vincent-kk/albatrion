import { useMemo } from 'react';

import { Checkbox } from 'antd';

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
    alias?: Dictionary<string>;
  };
}

interface ArrayJsonSchema extends ArraySchema {
  items: StringJsonSchema;
}

const FormTypeInputStringCheckbox = ({
  name,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<Array<string>, ArrayJsonSchema>) => {
  const options = useMemo(() => {
    const alias = jsonSchema?.options?.alias || {};
    return (
      jsonSchema.items?.enum?.map((value: string) => ({
        label: alias[value] || value,
        value,
      })) || []
    );
  }, [jsonSchema]);

  const handleChange = useHandle((value: string[]) => {
    onChange(value);
  });

  return (
    <Checkbox.Group
      name={name}
      options={options}
      disabled={disabled}
      defaultValue={defaultValue}
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
      jsonSchema.items.type === 'string' &&
      jsonSchema.items.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
