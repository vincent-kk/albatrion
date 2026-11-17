import { useCallback, useMemo } from 'react';

import { Slider, type SliderProps } from 'antd-mobile';

import { isArray } from '@winglet/common-utils/filter';
import { isNumberSchema } from '@winglet/json-schema/filter';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<number | [number, number], NumberSchema> {
  /**
   * Ignored: the schema type decides the shape. A numeric array schema renders a
   * range slider and a number schema renders a single thumb.
   * @deprecated The slider no longer reads this setting.
   */
  range?: SliderProps['range'];
  /** Labeled stops on the track, from `presentation.FieldInputProps.marks`. */
  marks?: SliderProps['marks'];
  /** `false` publishes on every move; otherwise only when the drag ends. */
  lazy?: boolean;
}

const FieldInputSlider = ({
  jsonSchema,
  type,
  disabled,
  defaultValue,
  onChange,
  marks,
  lazy,
  misfit,
}: FieldInputSliderProps) => {
  const range = type === 'array';
  const initialValue = range
    ? isArray(defaultValue) &&
      defaultValue.length === 2 &&
      defaultValue.every((value) => typeof value === 'number')
      ? defaultValue
      : undefined
    : typeof defaultValue === 'number'
      ? defaultValue
      : undefined;
  const handleChange = useCallback(
    (value: number | [number, number] | null) => {
      if (value === null) onChange(undefined);
      else if (range) {
        if (isArray(value) && !value.some(Number.isNaN)) onChange(value);
      } else if (typeof value === 'number' && !Number.isNaN(value))
        onChange(value);
    },
    [onChange, range],
  );

  const { min, max, step, ...changeHandler } = useMemo(() => {
    return {
      min: jsonSchema.minimum,
      max: jsonSchema.maximum,
      step: jsonSchema.multipleOf,
      ...(lazy === false
        ? { onChange: handleChange }
        : { onAfterChange: handleChange }),
    } as const;
  }, [handleChange, jsonSchema, lazy]);

  return (
    <div role="group" aria-invalid={misfit || undefined}>
      <Slider
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        range={range}
        marks={marks}
        defaultValue={initialValue}
        {...changeHandler}
      />
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: ({ schemaType: type, jsonSchema, format }) => {
    return (
      ((type === 'number' || type === 'integer') && format === 'slider') ||
      (type === 'array' &&
        jsonSchema.items &&
        isNumberSchema(jsonSchema.items) &&
        format === 'slider')
    );
  },
} satisfies FieldInputDefinition;
