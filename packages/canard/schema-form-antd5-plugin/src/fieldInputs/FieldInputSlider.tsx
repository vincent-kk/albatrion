import { Slider } from 'antd';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { antdMinorVersion } from './utils/antdMinorVersion';

/** Ant Design versions before 5.12 expose only the legacy commit callback. */
const commitEvent =
  antdMinorVersion < 12 ? 'onAfterChange' : 'onChangeComplete';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<number | null, NumberSchema> {
  /**
   * `false` publishes on every move; otherwise only when the drag ends.
   * From `presentation.FieldInputProps.lazy`.
   */
  lazy?: boolean;
}

const FieldInputSlider = ({
  path,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  lazy,
  misfit,
}: FieldInputSliderProps) => {
  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else if (!Number.isNaN(value)) onChange(value);
  });

  return (
    <div role="group" aria-invalid={misfit || undefined}>
      <Slider
        id={path}
        disabled={disabled || readOnly}
        min={jsonSchema.minimum}
        max={jsonSchema.maximum}
        step={jsonSchema.multipleOf}
        defaultValue={
          typeof defaultValue === 'number' ? defaultValue : undefined
        }
        {...{ [lazy === false ? 'onChange' : commitEvent]: handleChange }}
      />
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: {
    schemaType: ['number', 'integer'],
    inputType: 'slider',
  },
} satisfies FieldInputDefinition;
