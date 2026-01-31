import { type ReactNode, useMemo } from 'react';

import { Radio, type RadioChangeEvent } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

type StringJsonSchema = StringSchema<{
  alias?: { [label: string]: ReactNode };
}>;

type NumberJsonSchema = NumberSchema<{
  alias?: { [label: string]: ReactNode };
}>;

interface FormTypeInputRadioGroupProps
  extends FormTypeInputPropsWithSchema<
    string | number | null,
    StringJsonSchema | NumberJsonSchema,
    { size?: SizeType; radioLabels?: { [label: string]: ReactNode } }
  > {
  size?: SizeType;
  alias?: { [label: string]: ReactNode };
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
  alias,
}: FormTypeInputRadioGroupProps) => {
  const options = useMemo(() => {
    const labels = context.radioLabels || alias || {};
    return jsonSchema.enum
      ? map(jsonSchema.enum, (rawValue: string | number | null) => {
          const value = '' + rawValue;
          return {
            value,
            rawValue,
            label: labels[value] || value,
          };
        })
      : [];
  }, [context, jsonSchema, alias]);
  const initialValue = useMemo(
    () => options.find((option) => option.rawValue === defaultValue)?.value,
    [defaultValue, options],
  );
  const handleChange = useHandle((event: RadioChangeEvent) => {
    const rawValue = options.find(
      (option) => option.value === event.target.value,
    )?.rawValue;
    if (rawValue === undefined) return;
    onChange(rawValue);
  });
  return (
    <Radio.Group
      id={path}
      name={name}
      disabled={disabled}
      defaultValue={initialValue}
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
      !!jsonSchema.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
