import { useCallback, useMemo } from 'react';

import { Slider, type SliderProps } from 'antd-mobile';

import { isNumberSchema } from '@winglet/json-schema/filter';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FormTypeInputSliderProps
  extends FormTypeInputPropsWithSchema<
    number | [number, number],
    NumberSchema
  > {
  /** Two thumbs selecting a range, from `presentation.FormTypeInputProps.range`. */
  range?: SliderProps['range'];
  /** Labeled stops on the track, from `presentation.FormTypeInputProps.marks`. */
  marks?: SliderProps['marks'];
  /** `false` publishes on every move; otherwise only when the drag ends. */
  lazy?: boolean;
}

const FormTypeInputSlider = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  range,
  marks,
  lazy,
}: FormTypeInputSliderProps) => {
  const handleChange = useCallback(
    (value: number | [number, number] | null) => {
      if (value === null) onChange(NaN);
      else if (typeof value === 'number') onChange(value);
      else onChange(value);
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
    <Slider
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      range={range}
      marks={marks}
      defaultValue={defaultValue ?? undefined}
      {...changeHandler}
    />
  );
};

export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ schemaType: type, jsonSchema, format }) => {
    return (
      ((type === 'number' || type === 'integer') && format === 'slider') ||
      (type === 'array' &&
        jsonSchema.items &&
        isNumberSchema(jsonSchema.items) &&
        format === 'slider')
    );
  },
} satisfies FormTypeInputDefinition;
