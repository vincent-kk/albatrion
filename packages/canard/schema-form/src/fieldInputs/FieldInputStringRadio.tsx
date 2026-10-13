import { type ChangeEvent, Fragment, type ReactNode, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@/schema-form/types';

type RadioLabelsContext = {
  radioLabels?: {
    [label: string]: ReactNode;
  };
};

const FieldInputStringRadio = ({
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
  string | null,
  StringSchema,
  RadioLabelsContext
>) => {
  const radioOptions = useMemo(
    () =>
      jsonSchema.enum
        ? map(jsonSchema.enum, (rawValue: string | null) => {
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
  return (
    <Fragment>
      {map(radioOptions, ({ value, rawValue, label }) => (
        <label key={value} style={style} className={className}>
          <input
            type="radio"
            id={path}
            name={name}
            readOnly={readOnly}
            disabled={disabled}
            value={value}
            defaultChecked={rawValue === defaultValue}
            onChange={handleChange}
          />
          {label}
        </label>
      ))}
    </Fragment>
  );
};

export const FieldInputStringRadioDefinition = {
  Component: FieldInputStringRadio,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    (inputType === 'radio' || inputType === 'radiogroup') &&
    !!jsonSchema.enum?.length,
} satisfies FieldInputDefinition;
