import { type ChangeEvent, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
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
  misfit,
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
  const selected = isArray(defaultValue) ? defaultValue : [];
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const rawValue = checkboxOptions.find(
      (option) => option.value === value,
    )?.rawValue;
    if (rawValue === undefined) return;
    if (checked) onChange((prev) => [...(isArray(prev) ? prev : []), rawValue]);
    else
      onChange((prev) =>
        isArray(prev)
          ? (() => {
              const items = prev;
              const result: Array<(typeof items)[number]> = [];
              iterate: for (
                let index = 0, count = items.length;
                index < count;
                index++
              ) {
                if (!(index in items)) continue;
                const item = items[index];
                const option = item;
                {
                  if (option !== rawValue) result.push(item);
                  continue iterate;
                }
              }
              return result;
            })()
          : [],
      );
  });
  return (
    <div
      role="group"
      aria-labelledby={'label:' + path}
      aria-invalid={misfit || undefined}
    >
      {map(checkboxOptions, ({ value, rawValue, label }, index) => {
        const id = path + '-' + index;
        return (
          <label key={value} htmlFor={id} style={style} className={className}>
            <input
              type="checkbox"
              id={id}
              name={name}
              readOnly={readOnly}
              disabled={disabled}
              value={value}
              defaultChecked={selected.includes(rawValue)}
              onChange={handleChange}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
};
