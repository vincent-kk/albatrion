import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

type StringCheckboxJSONSchema = {
  items: StringSchema;
} & ArraySchema;

type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};

const FieldInputStringCheckbox = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  alias,
  style,
  className,
}: FieldInputPropsWithSchema<
  (string | null)[],
  StringCheckboxJSONSchema,
  CheckboxLabelsContext
>) => {
  const checkboxOptions = useMemo(
    () =>
      jsonSchema.items?.enum
        ? map(jsonSchema.items.enum, (rawValue) => {
            const value = '' + rawValue;
            return {
              value,
              rawValue,
              label: context.checkboxLabels?.[value] || alias?.[value] || value,
            };
          })
        : [],
    [context, jsonSchema, alias],
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const rawValue = checkboxOptions.find(
      (option) => option.value === value,
    )?.rawValue;
    if (rawValue === undefined) return;
    if (checked) onChange((prev) => [...(prev || []), rawValue]);
    else
      onChange((prev) => prev?.filter((option) => option !== rawValue) || []);
  });
  return (
    <div>
      {map(checkboxOptions, ({ value, rawValue, label }, index) => {
        const id = `${path}-${index}`;
        return (
          <label
            key={value}
            htmlFor={id}
            style={style}
            className={className}
          >
            <input
              type="checkbox"
              id={id}
              name={name}
              readOnly={readOnly}
              disabled={disabled}
              value={value}
              defaultChecked={defaultValue?.includes(rawValue)}
              onChange={handleChange}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
};

export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'array' &&
    inputType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length,
} satisfies FieldInputDefinition;
