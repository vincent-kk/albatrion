import { Stepper, type StepperProps } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';

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
  inputId,
  name,
  jsonSchema,
  schemaType,
  readOnly,
  disabled,
  value,
  onChange,
  formatter,
  parser,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputNumberProps) => {
  const bindControls = useControlIdentifiers(inputId, name, 'input');
  const handleChange = useHandle((input: number | null) => {
    if (input === null) onChange(undefined);
    else if (Number.isNaN(input)) return;
    else if (schemaType === 'integer' && !Number.isInteger(input)) return;
    else onChange(input);
  });
  return (
    <div
      ref={bindControls}
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : name}
      aria-invalid={misfit || undefined}
    >
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
  controlled: true,
  test: {
    schemaType: ['number', 'integer'],
  },
} satisfies FieldInputDefinition;
