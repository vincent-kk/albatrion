import { useMemo } from 'react';

import { useHandle } from '@winglet/react-utils';
import { Stepper } from 'antd-mobile';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@lumy-pack/schema-form';

const FormTypeInputNumber = ({
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<number, NumberSchema>) => {
  const { formatter, parser } = useMemo(
    () => jsonSchema.options || {},
    [jsonSchema.options],
  );
  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else onChange(value);
  });
  return (
    <Stepper
      inputReadOnly={readOnly}
      disabled={disabled}
      min={jsonSchema.minimum}
      max={jsonSchema.maximum}
      step={jsonSchema.multipleOf}
      formatter={formatter}
      parser={parser}
      defaultValue={defaultValue}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: {
    type: ['number', 'integer'],
  },
} satisfies FormTypeInputDefinition;
