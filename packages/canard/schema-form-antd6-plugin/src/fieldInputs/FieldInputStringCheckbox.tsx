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

import { getOwnLabel } from './utils/enum/getOwnLabel';

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
  id,
  name,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  alias,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputStringCheckboxProps) => {
  const options = useMemo(() => {
    const labels = context.checkboxLabels || alias || {};
    return jsonSchema.items?.enum
      ? map(jsonSchema.items.enum, (rawValue: string | null, index: number) => {
          const value = JSON.stringify(rawValue);
          return {
            id: `${id}-${index}`,
            value,
            rawValue,
            label: getOwnLabel(labels, '' + rawValue) || '' + rawValue,
          };
        })
      : [];
  }, [context, jsonSchema, alias, id]);

  const handleChange = useHandle((value: string[]) => {
    const convertedValues = value
      .map((v) => options.find((opt) => opt.value === v)?.rawValue)
      .filter((v) => v !== undefined);
    onChange(convertedValues);
  });

  const initialValue = useMemo(() => {
    return isArray(defaultValue) &&
      defaultValue.every((value) => value === null || typeof value === 'string')
      ? defaultValue.map((value) => JSON.stringify(value))
      : undefined;
  }, [defaultValue]);

  return (
    <div id={id}>
      <Checkbox.Group
        aria-labelledby={labelledBy}
        aria-invalid={misfit || undefined}
        name={name}
        style={{ display: 'flex' }}
        options={options}
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        onChange={handleChange}
      />
    </div>
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
