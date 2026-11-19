import { type ChangeEvent, useLayoutEffect, useMemo, useRef } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type { Nullable } from '@aileron/declare';

import { getFieldPartId } from '@/schema-form/helpers/fieldId/getFieldPartId';
import type {
  FieldInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

import type { RadioLabelsContext } from './type';

/** Render a radio group for a string enum node. */
export const FieldInputStringRadio = ({
  id: fieldId,
  jsonSchema,
  readOnly,
  disabled,
  misfit,
  defaultValue,
  value: committedValue,
  onChange,
  context,
  alias,
  style,
  className,
}: FieldInputPropsWithSchema<
  Nullable<string>,
  StringSchema,
  RadioLabelsContext
>) => {
  const radioOptions = useMemo(
    () =>
      jsonSchema.enum
        ? map(jsonSchema.enum, (rawValue: Nullable<string>) => {
            const value = '' + rawValue;
            return {
              value,
              rawValue,
              label: context.radioLabels?.[value] || alias?.[value] || value,
            };
          })
        : [],
    [context, jsonSchema, alias],
  );
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = radioOptions.find(
      (option) => option.value === event.target.value,
    )?.rawValue;
    if (rawValue === undefined) return;
    onChange(rawValue);
  });
  const group = useRef<HTMLSpanElement>(null);
  const restoreSelection = useHandle(() => {
    const inputs = group.current?.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]',
    );
    inputs?.forEach((input, index) => {
      input.checked = radioOptions[index].rawValue === committedValue;
    });
  });
  useLayoutEffect(restoreSelection, [fieldId, restoreSelection]);
  return (
    <span
      ref={group}
      role="group"
      aria-labelledby={getFieldPartId(fieldId, 'label')}
      aria-invalid={misfit || undefined}
    >
      {map(radioOptions, ({ value, rawValue, label }, index) => {
        const id = getFieldPartId(fieldId, 'option:' + index);
        return (
          <label key={value} htmlFor={id} style={style} className={className}>
            <input
              type="radio"
              id={id}
              name={fieldId}
              readOnly={readOnly}
              disabled={disabled}
              value={value}
              defaultChecked={rawValue === defaultValue}
              onChange={handleChange}
            />
            {label}
          </label>
        );
      })}
    </span>
  );
};
