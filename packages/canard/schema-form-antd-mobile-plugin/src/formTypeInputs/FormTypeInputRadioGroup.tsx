import { type ReactNode, useMemo } from 'react';

import { Radio } from 'antd-mobile';

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

const FormTypeInputRadioGroup = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
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
    return (
      jsonSchema.enum?.map((value) => ({
        label: alias[value] || value,
        value,
      })) || []
    );
  }, [context, jsonSchema]);

  const handleChange = useHandle(onChange);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <Radio.Group
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={handleChange}
      >
        {options.map((option) => (
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
