import { Stepper, type StepperProps } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

type SingleStepperProps = StepperProps extends { stringMode: false }
  ? StepperProps
  : never;

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<number, NumberSchema> {
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
    if (value === null) onChange(NaN);
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
