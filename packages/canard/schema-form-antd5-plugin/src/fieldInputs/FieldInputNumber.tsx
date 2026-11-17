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
  defaultValue,
  value,
  onChange,
  context,
  placeholder,
  formatter,
  parser,
  size,
  misfit,
}: FieldInputNumberProps) => {
  const withheld = useRef(false);
  const [revision, setRevision] = useState(0);
  const handleChange = useHandle((input: number | null) => {
    if (input === null) {
      withheld.current = false;
      onChange(undefined);
    } else if (
      Number.isNaN(input) ||
      (schemaType === 'integer' && !Number.isInteger(input))
    ) {
      withheld.current = true;
    } else {
      withheld.current = false;
      onChange(input);
    }
  });
  const handleBlur = useHandle(() => {
    // rc-input-number applies its blur bound correction after this callback.
    queueMicrotask(() => {
      if (!withheld.current) return;
      withheld.current = false;
      setRevision((previous) => previous + 1);
    });
  });
  const initialValue = revision === 0 ? defaultValue : value;
  return (
    <InputNumber
      key={revision}
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
      defaultValue={typeof initialValue === 'number' ? initialValue : undefined}
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
