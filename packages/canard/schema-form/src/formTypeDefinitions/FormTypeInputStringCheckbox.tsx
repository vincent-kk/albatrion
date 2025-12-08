import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

type StringCheckboxJsonSchema = {
  items: StringSchema;
} & ArraySchema;

type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};

const FormTypeInputStringCheckbox = ({
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
}: FormTypeInputPropsWithSchema<
  (string | null)[],
  StringCheckboxJsonSchema,
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
      {map(checkboxOptions, ({ value, rawValue, label }) => (
        <label key={value} style={style} className={className}>
          <input
            type="checkbox"
            id={path}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
            value={value}
            defaultChecked={defaultValue?.includes(rawValue)}
            onChange={handleChange}
          />
          {label}
        </label>
      ))}
    </div>
  );
};

export const FormTypeInputStringCheckboxDefinition = {
  Component: FormTypeInputStringCheckbox,
  test: ({ type, jsonSchema }) =>
    type === 'array' &&
    jsonSchema.formType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length,
} satisfies FormTypeInputDefinition;
