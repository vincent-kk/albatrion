import { useRef, useState } from 'react';

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
  value,
  defaultValue,
  onChange,
  context,
  placeholder,
  formatter,
  parser,
  size,
  misfit,
}: FieldInputNumberProps) => {
  const withheld = useRef(false);
  const [generation, setGeneration] = useState(0);
  const handleChange = useHandle((next: number | null) => {
    withheld.current = false;
    if (next === null) onChange(undefined);
    else if (
      Number.isNaN(next) ||
      (schemaType === 'integer' && !Number.isInteger(next))
    )
      withheld.current = true;
    else onChange(next);
  });
  const handleBlur = useHandle(() => {
    // rc-input-number applies its blur bound correction after this callback.
    queueMicrotask(() => {
      if (!withheld.current) return;
      withheld.current = false;
      setGeneration((g) => g + 1);
    });
  });
  return (
    <InputNumber
      key={generation}
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
      defaultValue={(generation ? value : defaultValue) ?? undefined}
      onChange={handleChange}
      onBlur={handleBlur}
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
