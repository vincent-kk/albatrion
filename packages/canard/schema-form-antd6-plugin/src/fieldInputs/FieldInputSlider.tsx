import { Slider } from 'antd';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { getSliderBounds } from './utils/slider/getSliderBounds';

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
  const { min, max, step, isEmpty } = getSliderBounds(jsonSchema);
  const isLocked = disabled || readOnly || isEmpty;
  const initialValue =
    typeof defaultValue === 'number' ? defaultValue : undefined;
  const storedDecimal =
    readOnly &&
    jsonSchema.multipleOf === undefined &&
    initialValue !== undefined &&
    initialValue >= min &&
    initialValue <= max &&
    !Number.isInteger(initialValue)
      ? initialValue
      : undefined;
  const handleChange = useHandle((value: number | null) => {
    if (isEmpty) return;
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
        min={min}
        max={max}
        step={storedDecimal === undefined ? step : null}
        marks={
          storedDecimal === undefined
            ? undefined
            : {
                [storedDecimal]: { label: ' ', style: { display: 'none' } },
              }
        }
        defaultValue={initialValue}
        {...{
          [lazy === false && min !== max ? 'onChange' : 'onChangeComplete']:
            handleChange,
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
