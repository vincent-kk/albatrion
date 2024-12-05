import { type ChangeEvent, useRef } from 'react';

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
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div>
      <input
        type="number"
        id={path}
        name={name}
        step={jsonSchema.multipleOf}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={jsonSchema?.placeholder}
        defaultValue={defaultValue}
        onChange={handleChange}
      />
      <div>input: {renderCount.current}</div>
    </div>
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;
