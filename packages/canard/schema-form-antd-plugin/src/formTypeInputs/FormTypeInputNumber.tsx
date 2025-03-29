import { useMemo } from 'react';

import { InputNumber } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<
    number,
    NumberSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
}

const FormTypeInputNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
}: FormTypeInputNumberProps) => {
  const { formatter, parser } = useMemo(
    () => jsonSchema.options || {},
    [jsonSchema.options],
  );

  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else onChange(value);
  });
  return (
    <InputNumber
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={jsonSchema.placeholder}
      min={jsonSchema.minimum}
      max={jsonSchema.maximum}
      step={jsonSchema.multipleOf}
      formatter={formatter}
      parser={parser}
      defaultValue={defaultValue}
      onChange={handleChange}
      size={size || context?.size}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: {
    type: ['number', 'integer'],
  },
} satisfies FormTypeInputDefinition;
