import { useMemo } from 'react';

import { InputNumber } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@lumy-pack/schema-form';

const FormTypeNumber = ({
  path,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<number, NumberSchema, { size?: SizeType }>) => {
  const { formatter, parser } = useMemo(
    () => jsonSchema.options ?? {},
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
      min={jsonSchema.minimum}
      max={jsonSchema.maximum}
      step={jsonSchema.multipleOf}
      formatter={formatter}
      parser={parser}
      defaultValue={defaultValue}
      onChange={handleChange}
      size={context?.size}
    />
  );
};

export const FormTypeNumberDefinition = {
  Component: FormTypeNumber,
  test: {
    type: ['number', 'integer'],
  },
} satisfies FormTypeInputDefinition;
