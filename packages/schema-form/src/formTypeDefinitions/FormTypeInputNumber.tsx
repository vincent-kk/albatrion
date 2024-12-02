import type { ChangeEvent } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputProps<number>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.valueAsNumber);
  });
  return (
    <input
      type="number"
      id={path}
      name={name}
      step={jsonSchema.multipleOf}
      readOnly={readOnly}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;
