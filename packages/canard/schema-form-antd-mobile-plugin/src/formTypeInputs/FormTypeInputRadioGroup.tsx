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

interface FormTypeInputRadioGroupProps
  extends FormTypeInputPropsWithSchema<
    string | number | null,
    StringSchema | NumberSchema,
    {
      radioLabels?: {
        [label: string]: ReactNode;
      };
    }
  > {
  alias?: { [label: string]: ReactNode };
}

const FormTypeInputRadioGroup = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  alias,
  style,
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

  const handleChange = useHandle((value: string | number) => {
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption === undefined) return;
    onChange(selectedOption.rawValue);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, ...style }}>
      <Radio.Group
        disabled={disabled}
        defaultValue={initialValue}
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
      !!jsonSchema.enum?.length
    );
  },
} satisfies FormTypeInputDefinition;
