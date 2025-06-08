import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@/schema-form/types';

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

const FormTypeInputStringEnum = ({
  path,
  name,
  jsonSchema,
  defaultValue,
  onChange,
  readOnly,
  disabled,
  context,
  style,
  className,
}: FormTypeInputPropsWithSchema<
  string,
  StringEnumJsonSchema,
  EnumLabelsContext
>) => {
  const enumOptions = useMemo(
    () =>
      jsonSchema.enum
        ? map(jsonSchema.enum, (value) => ({
            value,
            label:
              context.enumLabels?.[value] ||
              jsonSchema.options?.alias?.[value] ||
              value,
          }))
        : [],
    [context, jsonSchema],
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  });

  return (
    <select
      id={path}
      name={name}
      disabled={disabled || readOnly}
      defaultValue={defaultValue}
      onChange={handleChange}
      style={style}
      className={className}
    >
      {map(enumOptions, ({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ jsonSchema }) =>
    jsonSchema.type === 'string' && !!jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
