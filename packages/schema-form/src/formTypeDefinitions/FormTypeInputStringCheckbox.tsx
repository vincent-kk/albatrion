import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { useHandle } from '@lumy/schema-form/hooks/useHandle';
import type { FormTypeInputPropsWithSchema } from '@lumy/schema-form/types';

type StringCheckboxJsonSchema = {
  type: 'array';
  items: {
    type: 'string';
  };
  enum?: string[];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};

export const FormTypeInputStringCheckbox = ({
  jsonSchema,
  name,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  string[],
  StringCheckboxJsonSchema,
  CheckboxLabelsContext
>) => {
  const checkboxOptions = useMemo(
    () =>
      jsonSchema.enum?.map((value) => ({
        value,
        label:
          context.checkboxLabels?.[value] ||
          jsonSchema.options?.alias?.[value] ||
          value,
      })) || [],
    [context, jsonSchema],
  );

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      onChange((prev) => [...(prev || []), value]);
    } else {
      onChange((prev) => prev?.filter((option) => option !== value) || []);
    }
  });

  return (
    <div>
      {checkboxOptions.map(({ value, label }) => (
        <label key={value}>
          <input
            type="checkbox"
            name={name}
            value={value}
            defaultChecked={defaultValue?.includes(value)}
            onChange={handleChange}
          />
          {label}
        </label>
      ))}
    </div>
  );
};
