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
  /** Two thumbs selecting a range, from `presentation.FieldInputProps.range`. */
  range?: SliderProps['range'];
  /** Labeled stops on the track, from `presentation.FieldInputProps.marks`. */
  marks?: SliderProps['marks'];
  /** `false` publishes on every move; otherwise only when the drag ends. */
  lazy?: boolean;
}

const FieldInputSlider = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  range,
  marks,
  lazy,
  misfit,
}: FieldInputSliderProps) => {
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
      else if (typeof value === 'number') {
        if (!Number.isNaN(value)) onChange(value);
      } else if (!value.some(Number.isNaN)) onChange(value);
    },
    [onChange],
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
