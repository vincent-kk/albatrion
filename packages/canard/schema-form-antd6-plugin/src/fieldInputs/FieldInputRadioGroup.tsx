import { type ReactNode, useMemo } from 'react';

import { Radio, type RadioChangeEvent } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
  StringSchema,
} from '@canard/schema-form';

import { isRadioGroupInput } from '../utils/inputs/isRadioGroupInput';
import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  'aria-labelledby': labelledBy,
}: FieldInputRadioGroupProps) => {
  const options = useMemo(() => {
    const labels = context.radioLabels || alias || {};
    return jsonSchema.enum
      ? map(
          jsonSchema.enum,
          (rawValue: string | number | null, index: number) => {
            const value = JSON.stringify(rawValue);
            return {
              id: getInputId(index),
              value,
              rawValue,
              label: getOwnLabel(labels, '' + rawValue) || '' + rawValue,
            };
          },
        )
      : [];
  }, [context, jsonSchema, alias, getInputId]);
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
      id={inputId}
      aria-labelledby={labelledBy}
      aria-invalid={misfit || undefined}
      name={inputId}
      disabled={disabled || readOnly}
      defaultValue={initialValue}
      options={options}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FieldInputRadioGroupDefinition = {
  Component: FieldInputRadioGroup,
  test: isRadioGroupInput,
} satisfies FieldInputDefinition;
