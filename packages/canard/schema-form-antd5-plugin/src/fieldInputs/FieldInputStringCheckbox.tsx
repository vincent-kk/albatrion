import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd';

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

type StringJSONSchema = StringSchema<{
  alias?: { [label: string]: ReactNode };
}>;

type ArrayJSONSchema = ArraySchema<{
  alias?: { [label: string]: ReactNode };
}> & {
  items: StringJSONSchema;
};

interface FieldInputStringCheckboxProps
  extends FieldInputPropsWithSchema<
    Array<string | null> | null,
    ArrayJSONSchema,
    { checkboxLabels?: { [label: string]: ReactNode } }
  > {
  alias?: { [label: string]: ReactNode };
}

const FieldInputStringCheckbox = ({
  name,
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

  const handleChange = useHandle((value: string[]) => {
    const convertedValues = value
      .map((v) => options.find((opt) => opt.value === v)?.rawValue)
      .filter((v) => v !== undefined);
    onChange(convertedValues);
  });

  const initialValue = useMemo(() => {
    return isArray(defaultValue) ? defaultValue.map((v) => '' + v) : undefined;
  }, [defaultValue]);

  return (
    <>
      <div role="group" aria-invalid={misfit || undefined}>
        <Checkbox.Group
          name={name}
          style={{ display: 'flex' }}
          options={options}
          disabled={disabled}
          defaultValue={initialValue}
          onChange={handleChange}
        />
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
