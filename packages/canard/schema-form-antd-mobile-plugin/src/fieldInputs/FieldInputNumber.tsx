import { Stepper, type StepperProps } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

type SingleStepperProps = StepperProps extends { stringMode: false }
  ? StepperProps
  : never;

interface FieldInputNumberProps
  extends FieldInputPropsWithSchema<number | null, NumberSchema> {
  formatter?: SingleStepperProps['formatter'];
  parser?: SingleStepperProps['parser'];
}

const FieldInputNumber = ({
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  formatter,
  parser,
}: FieldInputNumberProps) => {
  const handleChange = useHandle((value: number | null) => {
    onChange(value);
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
      defaultValue={defaultValue ?? undefined}
      onChange={handleChange}
    />
  );
};

export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
