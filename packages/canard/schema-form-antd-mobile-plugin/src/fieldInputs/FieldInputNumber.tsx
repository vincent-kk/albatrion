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
  schemaType,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  formatter,
  parser,
  misfit,
}: FieldInputNumberProps) => {
  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else if (Number.isNaN(value)) return;
    else if (schemaType === 'integer' && !Number.isInteger(value)) return;
    else onChange(value);
  });
  return (
    <>
      <div role="group" aria-invalid={misfit || undefined}>
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
      </div>
      {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
