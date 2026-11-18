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

import { isRadioGroupInput } from '../utils/inputs/isRadioGroupInput';
import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';
import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  id,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  alias,
  style,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputRadioGroupProps) => {
  const options = useMemo(() => {
    const labels = context.radioLabels || alias || {};
    return jsonSchema.enum
      ? map(jsonSchema.enum, (rawValue: string | number | null) => {
          const value = JSON.stringify(rawValue);
          return {
            value,
            rawValue,
            label: getOwnLabel(labels, '' + rawValue) || '' + rawValue,
          };
        })
      : [];
  }, [context, jsonSchema, alias]);

  const bindControls = useControlIdentifiers(id, id, 'input', true, options);
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
    <div
      ref={bindControls}
      id={id}
      aria-labelledby={labelledBy}
      role="radiogroup"
      aria-invalid={misfit || undefined}
      style={{ display: 'flex', flexDirection: 'row', gap: 8, ...style }}
    >
      <Radio.Group
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        onChange={handleChange}
      >
        {map(options, (option, index) => (
          <Radio
            key={option.value}
            id={`${id}-${index}`}
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
  test: isRadioGroupInput,
} satisfies FieldInputDefinition;
