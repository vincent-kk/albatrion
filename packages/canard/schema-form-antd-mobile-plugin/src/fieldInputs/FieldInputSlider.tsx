import { useCallback, useMemo } from 'react';

import { Slider, type SliderProps } from 'antd-mobile';

import { isArray } from '@winglet/common-utils/filter';
import { isNumberSchema } from '@winglet/json-schema/filter';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

/** A numeric array schema, rendered as a range slider. */
type NumberArraySchema = ArraySchema & { items: NumberSchema };

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<
    number | [number, number],
    NumberSchema | NumberArraySchema
  > {
  /**
   * Ignored: the schema type decides the shape. A numeric array schema renders a
   * range slider and a number schema renders a single thumb.
   * @deprecated Ignored. The schema type decides the shape.
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
  readOnly,
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

  const constraints = range && jsonSchema.items && isNumberSchema(jsonSchema.items) ? jsonSchema.items : jsonSchema;

  const { min, max, step, ...changeHandler } = useMemo(() => {
    return {
      min: constraints.minimum ?? jsonSchema.minimum,
      max: constraints.maximum ?? jsonSchema.maximum,
      step: constraints.multipleOf ?? jsonSchema.multipleOf,
      ...(lazy === false
        ? { onChange: handleChange }
        : { onAfterChange: handleChange }),
    } as const;
  }, [handleChange, jsonSchema, constraints, lazy]);

  return (
    <div role="group" aria-invalid={misfit || undefined}>
      <Slider
        disabled={disabled || readOnly}
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
