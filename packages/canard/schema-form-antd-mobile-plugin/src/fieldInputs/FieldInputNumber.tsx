import { useRef, useState } from 'react';

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
  value,
  defaultValue,
  onChange,
  formatter,
  parser,
  misfit,
}: FieldInputNumberProps) => {
  const withheld = useRef(false);
  const [generation, setGeneration] = useState(0);
  const handleChange = useHandle((input: number | null) => {
    withheld.current = false;
    if (input === null) onChange(undefined);
    else if (Number.isNaN(input)) withheld.current = true;
    else if (schemaType === 'integer' && !Number.isInteger(input))
      withheld.current = true;
    else onChange(input);
  });
  const handleBlur = useHandle(() => {
    if (!withheld.current) return;
    withheld.current = false;
    setGeneration((previous) => previous + 1);
  });
  return (
    <>
      <div role="group" aria-invalid={misfit || undefined}>
        <Stepper
          key={generation}
          inputReadOnly={readOnly}
          disabled={disabled}
          min={jsonSchema.minimum}
          max={jsonSchema.maximum}
          step={jsonSchema.multipleOf}
          formatter={formatter}
          parser={parser}
          defaultValue={(generation === 0 ? defaultValue : value) ?? undefined}
          onChange={handleChange}
          onBlur={handleBlur}
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
