import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputPropsWithSchema } from '@lumy/schema-form/types';

type StringEnumJsonSchema = {
  type: 'string';
  enum?: string[];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

type EnumLabelsContext = {
  enumLabels?: {
    [label: string]: ReactNode;
  };
};

export const FormTypeInputStringEnum = ({
  jsonSchema,
  name,
  defaultValue,
  onChange,
  readOnly,
  context,
}: FormTypeInputPropsWithSchema<
  string,
  StringEnumJsonSchema,
  EnumLabelsContext
>) => {
  const enumOptions = useMemo(
    () =>
      jsonSchema.enum?.map((value) => ({
        value,
        label:
          context.enumLabels?.[value] ||
          jsonSchema.options?.alias?.[value] ||
          value,
      })) || [],
    [context, jsonSchema],
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  });

  return (
    <select
      name={name}
      disabled={readOnly}
      defaultValue={defaultValue}
      onChange={handleChange}
    >
      {enumOptions.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};
