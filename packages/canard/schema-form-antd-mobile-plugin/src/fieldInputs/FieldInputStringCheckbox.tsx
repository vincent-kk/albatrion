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

import { getEnumOptions } from './utils/enum/getEnumOptions';

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
  const handleChange = useHandle((tokens: CheckboxValue[]) => {
    const selected = options
      .filter(({ value }) => tokens.includes(value))
      .map(({ rawValue }) => rawValue);
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

  return (
    <div
      className={className}
      id={inputId}
      aria-labelledby={labelId}
      role="group"
      aria-invalid={misfit || undefined}
      style={{ display: 'flex', flexDirection: 'row', gap: 8, ...style }}
    >
      <Checkbox.Group
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        onChange={handleChange}
      >
        {map(options, (option) => (
          <Checkbox
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
          </Checkbox>
        ))}
      </Checkbox.Group>
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
