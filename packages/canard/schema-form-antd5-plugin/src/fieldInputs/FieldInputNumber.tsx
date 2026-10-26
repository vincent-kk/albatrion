import { InputNumber, type InputNumberProps } from 'antd';
import type { SizeType } from 'antd/es/config-provider/SizeContext';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FieldInputNumberProps
  extends FieldInputPropsWithSchema<
    number | null,
    NumberSchema,
    { size?: SizeType }
  > {
  size?: SizeType;
  formatter?: InputNumberProps<number>['formatter'];
  parser?: InputNumberProps<number>['parser'];
}

const FieldInputNumber = ({
  path,
  name,
  jsonSchema,
  schemaType,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  placeholder,
  formatter,
  parser,
  size,
  misfit,
}: FieldInputNumberProps) => {
  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else if (Number.isNaN(value)) return;
    else if (schemaType === 'integer' && !Number.isInteger(value)) return;
    else onChange(value);
  });
  return (
    <InputNumber
      id={path}
      name={name}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      min={jsonSchema.minimum}
      max={jsonSchema.maximum}
      step={jsonSchema.multipleOf}
      formatter={formatter}
      parser={parser}
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
      size={size || context?.size}
      status={misfit ? 'error' : undefined}
      aria-invalid={misfit || undefined}
    />
  );
};

export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
