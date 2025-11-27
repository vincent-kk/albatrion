import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

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
  string | null,
  StringSchema<{ alias?: { [label: string]: ReactNode } }>,
  EnumLabelsContext
>) => {
  const enumOptions = useMemo(
    () =>
      jsonSchema.enum
        ? map(jsonSchema.enum, (rawValue) => {
            const value = '' + rawValue;
            return {
              value,
              rawValue,
              label:
                context.enumLabels?.[value] ||
                jsonSchema.options?.alias?.[value] ||
                value,
            };
          })
        : [],
    [context, jsonSchema],
  );
  const initialValue = useMemo(() => {
    if (defaultValue === undefined) return undefined;
    if (defaultValue === null) return '' + null;
    return defaultValue;
  }, [defaultValue]);
  const handleChange = useHandle((event: ChangeEvent<HTMLSelectElement>) => {
    const rawValue = enumOptions.find(
      (option) => option.value === event.target.value,
    )?.rawValue;
    if (rawValue === undefined) return;
    onChange(rawValue);
  });
  return (
    <select
      id={path}
      name={name}
      disabled={disabled || readOnly}
      defaultValue={initialValue}
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
  test: ({ type, jsonSchema }) =>
    type === 'string' && !!jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
