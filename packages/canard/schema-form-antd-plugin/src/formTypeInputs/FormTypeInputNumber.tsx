import { InputNumber, type InputNumberProps } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<
    number | null,
    NumberSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  formatter?: InputNumberProps<number>['formatter'];
  parser?: InputNumberProps<number>['parser'];
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
  formatter,
  parser,
  size,
}: FormTypeInputNumberProps) => {
  const handleChange = useHandle((value: number | null) => {
    onChange(value);
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
      defaultValue={defaultValue ?? undefined}
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
