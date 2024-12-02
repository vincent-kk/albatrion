import { useMemo } from 'react';

import { Radio, type RadioChangeEvent } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@lumy-pack/schema-form';

interface StringJsonSchema extends StringSchema {
  enum?: string[];
  options?: {
    alias?: Dictionary<string>;
  };
}

interface NumberJsonSchema extends NumberSchema {
  enum?: number[];
  options?: {
    alias?: Dictionary<string>;
  };
}

const FormTypeInputRadioGroup = ({
  path,
  name,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  string | number,
  StringJsonSchema | NumberJsonSchema,
  { size?: SizeType }
>) => {
  const options = useMemo(() => {
    const alias = jsonSchema.options?.alias || {};
    return jsonSchema.enum?.map((value) => ({
      label: alias[value] || value,
      value,
    }));
  }, [jsonSchema]);
  const handleChange = useHandle((event: RadioChangeEvent) => {
    onChange(event.target.value);
  });
  return (
    <Radio.Group
      id={path}
      name={name}
      disabled={disabled}
      defaultValue={defaultValue}
      options={options}
      onChange={handleChange}
      size={context?.size}
    />
  );
};

export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }) => {
    return (
      (type === 'string' || type === 'number' || type === 'integer') &&
      (formType === 'radio' || formType === 'radiogroup') &&
      jsonSchema.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
