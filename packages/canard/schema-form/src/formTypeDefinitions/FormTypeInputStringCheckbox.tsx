import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@/schema-form/types';

type StringCheckboxJsonSchema = {
  type: 'array';
  items: {
    type: 'string';
    enum?: string[];
    options?: {
      alias?: { [label: string]: ReactNode };
    };
  };
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

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
  style,
  className,
}: FormTypeInputPropsWithSchema<
  string[],
  StringCheckboxJsonSchema,
  CheckboxLabelsContext
>) => {
  const checkboxOptions = useMemo(
    () =>
      jsonSchema.items?.enum
        ? map(jsonSchema.items.enum, (value) => ({
            value,
            label:
              context.checkboxLabels?.[value] ||
              jsonSchema.options?.alias?.[value] ||
              jsonSchema.items?.options?.alias?.[value] ||
              value,
          }))
        : [],
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
      {map(checkboxOptions, ({ value, label }) => (
        <label key={value} style={style} className={className}>
          <input
            type="checkbox"
            id={path}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
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

export const FormTypeInputStringCheckboxDefinition = {
  Component: FormTypeInputStringCheckbox,
  test: ({ jsonSchema }) =>
    jsonSchema.type === 'array' &&
    jsonSchema.formType === 'checkbox' &&
    jsonSchema.items?.type === 'string' &&
    !!jsonSchema.items?.enum?.length,
} satisfies FormTypeInputDefinition;
