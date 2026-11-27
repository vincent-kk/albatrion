import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd';

import { isArray } from '@winglet/common-utils/filter';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { getEnumOptions } from './utils/enum/getEnumOptions';

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
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  alias,
  misfit,
  className,
  style,
}: FieldInputStringCheckboxProps) => {
  const values = jsonSchema.items?.enum;
  const labels = context.checkboxLabels || alias;
  const options = useMemo(
    () => getEnumOptions(values, labels, getInputId),
    [values, labels, getInputId],
  );
  const handleChange = useHandle((tokens: string[]) => {
    const selected = tokens.map((token) => JSON.parse(token));
    onChange((previous) => {
      const stored = isArray(previous) ? previous : [];
      return [
        ...stored.filter(
          (value) => selected.includes(value) || !values?.includes(value),
        ),
        ...selected.filter((value) => !stored.includes(value)),
      ];
    });
  });
  const initialValue = useMemo(
    () =>
      options
        .filter(
          ({ rawValue }) =>
            isArray(defaultValue) && defaultValue.includes(rawValue),
        )
        .map(({ value }) => value),
    [defaultValue, options],
  );

  return (
    <div
      className={className}
      style={style}
      id={inputId}
      role="group"
      aria-labelledby={labelId}
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
  test: ({ type, inputType, jsonSchema }) => {
    return (
      type === 'array' &&
      inputType === 'checkbox' &&
      isStringSchema(jsonSchema.items) &&
      !!jsonSchema.items.enum?.length
    );
  },
} satisfies FieldInputDefinition;
