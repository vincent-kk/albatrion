import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type ArrayJSONSchema = ArraySchema & {
  items: StringSchema;
};

interface FieldInputStringCheckboxProps
  extends FieldInputPropsWithSchema<
    Array<string | null>,
    ArrayJSONSchema,
    { checkboxLabels?: { [label: string]: ReactNode } }
  > {
  alias?: { [label: string]: ReactNode };
}

const FieldInputStringCheckbox = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  alias,
  misfit,
}: FieldInputStringCheckboxProps) => {
  const options = useMemo(() => {
    const labels = context.checkboxLabels || alias || {};
    return jsonSchema.items?.enum
      ? map(jsonSchema.items.enum, (rawValue: string | null) => {
          const value = '' + rawValue;
          return {
            value,
            rawValue,
            label: labels[value] || value,
          };
        })
      : [];
  }, [context, jsonSchema, alias]);

  const initialValue = useMemo(() => {
    return isArray(defaultValue)
      ? map(defaultValue, (v) => '' + v)
      : undefined;
  }, [defaultValue]);

  const handleChange = useHandle((value: CheckboxValue[]) => {
    const convertedValues = map(value, (v) => {
      const option = options.find((opt) => opt.value === v.toString());
      return option ? option.rawValue : v.toString();
    });
    onChange(convertedValues);
  });

  return (
    <>
      <div
        role="group"
        aria-invalid={misfit || undefined}
        style={{ display: 'flex', flexDirection: 'row', gap: 8 }}
      >
        <Checkbox.Group
          disabled={disabled}
          defaultValue={initialValue}
          onChange={handleChange}
        >
          {map(options, (option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              style={{
                '--icon-size': '24px',
                '--font-size': '20px',
                '--gap': '6px',
              }}
            >
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  test: ({ type, inputType, jsonSchema }) => {
    return (
      type === 'array' &&
      inputType === 'checkbox' &&
      isStringSchema(jsonSchema.items) &&
      !!jsonSchema.items.enum?.length
    );
  },
} satisfies FieldInputDefinition;
