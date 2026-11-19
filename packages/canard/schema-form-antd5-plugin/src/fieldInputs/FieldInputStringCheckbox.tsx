import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { getOwnLabel } from './utils/enum/getOwnLabel';
import { mergeEnumSelection } from './utils/enum/mergeEnumSelection';

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
    onChange(previous => mergeEnumSelection(isArray(previous) ? previous : [], value, options));
  });

  const initialValue = useMemo(() => {
    return isArray(defaultValue)
      ? defaultValue.map((value) => JSON.stringify(value))
      : undefined;
  }, [defaultValue]);

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={labelledBy}
      aria-invalid={misfit || undefined}
    >
      <Checkbox.Group
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
  test: isCheckboxGroupInput,
} satisfies FieldInputDefinition;
