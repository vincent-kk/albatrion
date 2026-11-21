import { Slider } from 'antd';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<number | null, NumberSchema> {
  /**
   * `false` publishes on every move; otherwise only when the drag ends.
   * From `presentation.FieldInputProps.lazy`.
   */
  lazy?: boolean;
}

const FieldInputSlider = ({
  inputId,
  labelId,
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
        id={inputId}
        ariaLabelledByForHandle={labelId}
        disabled={disabled || readOnly}
        min={jsonSchema.minimum}
        max={jsonSchema.maximum}
        step={jsonSchema.multipleOf}
        defaultValue={
          typeof defaultValue === 'number' ? defaultValue : undefined
        }
        {...{
          [lazy === false ? 'onChange' : 'onChangeComplete']: handleChange,
        }}
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
