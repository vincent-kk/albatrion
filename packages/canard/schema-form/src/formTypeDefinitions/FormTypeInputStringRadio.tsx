import { type ChangeEvent, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils';
import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@/schema-form/types';

type StringRadioJsonSchema = {
  type: 'string';
  enum?: string[];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

type RadioLabelsContext = {
  radioLabels?: {
    [label: string]: ReactNode;
  };
};

const FormTypeInputStringRadio = ({
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
  string,
  StringRadioJsonSchema,
  RadioLabelsContext
>) => {
  const radioOptions = useMemo(
    () =>
      jsonSchema.enum
        ? map(jsonSchema.enum, (value: string | number) => ({
            value,
            label:
              context.radioLabels?.[value] ||
              jsonSchema.options?.alias?.[value] ||
              value,
          }))
        : [],
    [context, jsonSchema],
  );

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <>
      {map(radioOptions, ({ value, label }) => (
        <label key={value} style={style} className={className}>
          <input
            type="radio"
            id={path}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
            value={value}
            defaultChecked={value === defaultValue}
            onChange={handleChange}
          />
          {label}
        </label>
      ))}
    </>
  );
};

export const FormTypeInputStringRadioDefinition = {
  Component: FormTypeInputStringRadio,
  test: ({ jsonSchema }) =>
    jsonSchema.type === 'string' &&
    (jsonSchema.formType === 'radio' || jsonSchema.formType === 'radiogroup') &&
    !!jsonSchema.enum?.length,
} satisfies FormTypeInputDefinition;
