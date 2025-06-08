import type { ChangeEvent } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  style,
  className,
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
      placeholder={jsonSchema?.placeholder}
      defaultValue={defaultValue}
      onChange={handleChange}
      style={style}
      className={className}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;
