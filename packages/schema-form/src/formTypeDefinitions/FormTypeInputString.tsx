import { type ChangeEvent, useRef } from 'react';

import { useHandle } from '@lumy-pack/common-react';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy/schema-form/types';

const FormTypeInputString = ({
  path,
  name,
  readOnly,
  disabled,
  jsonSchema,
  defaultValue,
  onChange,
}: FormTypeInputProps<string>) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  const renderCount = useRef(0);
  renderCount.current += 1;
  return (
    <div>
      <input
        type="text"
        id={path}
        name={name}
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

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
