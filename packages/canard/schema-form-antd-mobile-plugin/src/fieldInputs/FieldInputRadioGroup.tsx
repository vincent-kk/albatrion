import { type ReactNode, useMemo } from 'react';

import { Radio } from 'antd-mobile';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

import { getEnumOptions } from './utils/enum/getEnumOptions';

interface FieldInputRadioGroupProps
  extends FieldInputPropsWithSchema<
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

const FieldInputRadioGroup = ({
  inputId,
  labelId,
  getInputId,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  alias,
  style,
  misfit,
  className,
}: FieldInputRadioGroupProps) => {
  const values: readonly (string | number | null)[] | undefined =
    jsonSchema.enum;
  const labels = context.radioLabels || alias;
  const options = useMemo(
    () => getEnumOptions(values, labels, getInputId),
    [values, labels, getInputId],
  );

  const initialValue = useMemo(
    () => options.find((option) => option.rawValue === defaultValue)?.value,
    [defaultValue, options],
  );
  const handleChange = useHandle((value: string | number) => {
    const selected = options.find((option) => option.value === value);
    if (selected) onChange(selected.rawValue);
  });

  return (
    <div
      className={className}
      id={inputId}
      aria-labelledby={labelId}
      role="radiogroup"
      aria-invalid={misfit || undefined}
      style={{ display: 'flex', flexDirection: 'row', gap: 8, ...style }}
    >
      <Radio.Group
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        onChange={handleChange}
      >
        {map(options, (option) => (
          <Radio
            key={option.value}
            id={option.id}
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

export const FieldInputRadioGroupDefinition = {
  Component: FieldInputRadioGroup,
  test: ({ schemaType: type, inputType, jsonSchema }) => {
    return (
      (type === 'string' || type === 'number' || type === 'integer') &&
      (inputType === 'radio' || inputType === 'radiogroup') &&
      !!jsonSchema.enum?.length
    );
  },
} satisfies FieldInputDefinition;
