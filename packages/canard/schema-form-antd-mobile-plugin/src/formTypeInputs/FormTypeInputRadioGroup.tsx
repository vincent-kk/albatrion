import { type ReactNode, useMemo } from 'react';

import { Radio } from 'antd-mobile';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

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

const FormTypeInputRadioGroup = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  style,
}: FormTypeInputPropsWithSchema<
  string | number,
  StringJsonSchema | NumberJsonSchema,
  {
    radioLabels?: {
      [label: string]: ReactNode;
    };
  }
>) => {
  const options = useMemo(() => {
    const alias = context.radioLabels || jsonSchema.options?.alias || {};
    return jsonSchema.enum
      ? map(jsonSchema.enum, (value: string | number) => ({
          label: alias[value] || value,
          value,
        }))
      : [];
  }, [context, jsonSchema]);

  const handleChange = useHandle(onChange);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, ...style }}>
      <Radio.Group
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={handleChange}
      >
        {map(options, (option) => (
          <Radio
            key={option.value}
            value={option.value}
            style={{
              '--icon-size': '24px',
              '--font-size': '20px',
              '--gap': '6px',
            }}
          >
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
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
