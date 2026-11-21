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
  focusRef,
  labelId,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  lazy,
  misfit,
  className,
  style,
}: FieldInputSliderProps) => {
  const isLocked = disabled || readOnly;
  const handleChange = useHandle((value: number | null) => {
    if (value === null) onChange(undefined);
    else if (!Number.isNaN(value)) onChange(value);
  });

  return (
    <div
      className={className}
      style={style}
      role="group"
      aria-invalid={misfit || undefined}
    >
      <Slider
        id={inputId}
        ref={isLocked ? undefined : focusRef}
        ariaLabelledByForHandle={labelId}
        disabled={isLocked}
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
