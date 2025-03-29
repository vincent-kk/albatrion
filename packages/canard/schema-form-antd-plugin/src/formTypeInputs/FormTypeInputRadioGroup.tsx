import { type ReactNode, useMemo } from 'react';

import { Radio, type RadioChangeEvent } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringJsonSchema extends StringSchema {
  enum?: string[];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
}

interface NumberJsonSchema extends NumberSchema {
  enum?: number[];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
}

interface FormTypeInputRadioGroupProps
  extends FormTypeInputPropsWithSchema<
    string | number,
    StringJsonSchema | NumberJsonSchema,
    { size?: SizeType; radioLabels?: { [label: string]: ReactNode } }
  > {
  size?: SizeType;
}

const FormTypeInputRadioGroup = ({
  path,
  name,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputRadioGroupProps) => {
  const options = useMemo(() => {
    const alias = context.radioLabels || jsonSchema.options?.alias || {};
    return jsonSchema.enum?.map((value) => ({
      label: alias[value] || value,
      value,
    }));
  }, [context, jsonSchema]);
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
      size={size || context?.size}
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
