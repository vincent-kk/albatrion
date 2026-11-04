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

/** Parses draft text, returning NaN for non-numeric text so the Stepper keeps the draft. */
const parseDraft = (text: string) => (text.trim() === '' ? NaN : Number(text));

const FieldInputNumber = ({
  jsonSchema,
  schemaType,
  readOnly,
  disabled,
  value,
  onChange,
  formatter,
  parser,
  misfit,
}: FieldInputNumberProps) => {
  const handleChange = useHandle((input: number | null) => {
    if (input === null) onChange(undefined);
    else if (Number.isNaN(input)) return;
    else if (schemaType === 'integer' && !Number.isInteger(input)) return;
    else onChange(input);
  });
  return (
    <div role="group" aria-invalid={misfit || undefined}>
      <Stepper
        inputReadOnly={readOnly}
        disabled={disabled}
        min={jsonSchema.minimum}
        max={jsonSchema.maximum}
        step={jsonSchema.multipleOf}
        formatter={formatter}
        parser={parser ?? parseDraft}
        allowEmpty
        value={typeof value === 'number' ? value : null}
        onChange={handleChange}
      />
    </div>
  );
};

export const FieldInputNumberDefinition = {
  Component: FieldInputNumber,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
