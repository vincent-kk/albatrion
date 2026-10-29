import { type ChangeEvent, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type { Optional } from '@aileron/declare';
import type { Nullable } from '@aileron/declare';

import type {
  FieldInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

import type { EnumLabelsContext } from './type';

/** Render a select for a string enum node. */

export const FieldInputStringEnum = ({
  path,
  name,
  jsonSchema,
  defaultValue,
  onChange,
  readOnly,
  disabled,
  misfit,
  context,
  alias,
  style,
  className,
}: FieldInputPropsWithSchema<
  Nullable<string>,
  StringSchema,
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
              label: context.enumLabels?.[value] || alias?.[value] || value,
            };
          })
        : [],
    [context, jsonSchema, alias],
  );
  const initialValue = useMemo(() => {
    if (defaultValue === undefined) return '';
    if (defaultValue === null) return '' + null;
    return defaultValue;
  }, [defaultValue]);
  let outOfDomainValue: Optional<string>;
  if (defaultValue === undefined) {
    outOfDomainValue = '';
  } else {
    let matches = defaultValue !== null;
    if (matches) {
      let hasMatch = false;
      for (let index = 0, count = enumOptions.length; index < count; index++) {
        const option = enumOptions[index];

        if (option.value === '' + defaultValue) {
          hasMatch = true;
          break;
        }
      }
      matches = !hasMatch;
    }
    outOfDomainValue = matches ? '' + defaultValue : undefined;
  }

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
      aria-invalid={misfit || undefined}
    >
      {outOfDomainValue !== undefined && (
        <option disabled value={outOfDomainValue}>
          {outOfDomainValue}
        </option>
      )}
      {map(enumOptions, ({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};
