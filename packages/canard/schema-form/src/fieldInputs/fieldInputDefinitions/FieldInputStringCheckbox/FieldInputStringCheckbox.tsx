import { type ChangeEvent, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputPropsWithSchema } from '@/schema-form/types';

import type { CheckboxLabelsContext, StringCheckboxJSONSchema } from './type';

/** Render a checkbox per enum choice of a string-array node. */
export const FieldInputStringCheckbox = ({
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
    <div role="group" aria-labelledby={`label:${path}`}>
      {map(checkboxOptions, ({ value, rawValue, label }, index) => {
        const id = `${path}-${index}`;
        return (
          <label key={value} htmlFor={id} style={style} className={className}>
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
