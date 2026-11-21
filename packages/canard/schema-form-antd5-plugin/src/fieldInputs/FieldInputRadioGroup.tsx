import { type ReactNode, useMemo } from 'react';

import { Radio, type RadioChangeEvent } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

import { getEnumOptions } from './utils/enum/getEnumOptions';

type StringJSONSchema = StringSchema<{
  alias?: { [label: string]: ReactNode };
}>;

type NumberJSONSchema = NumberSchema<{
  alias?: { [label: string]: ReactNode };
}>;

interface FieldInputRadioGroupProps
  extends FieldInputPropsWithSchema<
    string | number | null,
    StringJSONSchema | NumberJSONSchema,
    { size?: SizeType; radioLabels?: { [label: string]: ReactNode } }
  > {
  size?: SizeType;
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
  size,
  alias,
  misfit,
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
  const handleChange = useHandle((event: RadioChangeEvent) => {
    onChange(JSON.parse(event.target.value));
  });
  return (
    <div
      id={inputId}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={misfit || undefined}
    >
      <Radio.Group
        name={inputId}
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        options={options}
        onChange={handleChange}
        size={size || context?.size}
      />
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
