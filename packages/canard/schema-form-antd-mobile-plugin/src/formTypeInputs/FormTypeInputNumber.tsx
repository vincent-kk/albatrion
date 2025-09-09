import { Stepper, type StepperProps } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

type SingleStepperProps = StepperProps extends { stringMode: false }
  ? StepperProps
  : never;

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<number | null, NumberSchema> {
  formatter?: SingleStepperProps['formatter'];
  parser?: SingleStepperProps['parser'];
}

const FormTypeInputNumber = ({
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  formatter,
  parser,
}: FormTypeInputNumberProps) => {
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

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: {
    type: ['number', 'integer'],
  },
} satisfies FormTypeInputDefinition;
