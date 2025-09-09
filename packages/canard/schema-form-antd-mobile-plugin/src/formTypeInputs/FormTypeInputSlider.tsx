import { useCallback, useMemo } from 'react';

import { Slider } from 'antd-mobile';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

const FormTypeInputSlider = ({
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<number | [number, number], NumberSchema>) => {
  const handleChange = useCallback(
    (value: number | [number, number] | null) => {
      if (value === null) onChange(NaN);
      else if (typeof value === 'number') onChange(value);
      else onChange(value);
    },
    [onChange],
  );

  const { min, max, step, range, marks, ...changeHandler } = useMemo(() => {
    return {
      min: jsonSchema.minimum,
      max: jsonSchema.maximum,
      step: jsonSchema.multipleOf,
      range: jsonSchema.options?.range,
      marks: jsonSchema.options?.marks,
      ...(jsonSchema.options?.lazy === false
        ? { onChange: handleChange }
        : { onAfterChange: handleChange }),
    } as const;
  }, [handleChange, jsonSchema]);

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
  test: ({ type, jsonSchema, format }) => {
    return (
      ((type === 'number' || type === 'integer') && format === 'slider') ||
      (type === 'array' &&
        jsonSchema.items &&
        (jsonSchema.items.type === 'number' ||
          jsonSchema.items.type === 'integer') &&
        format === 'slider')
    );
  },
} satisfies FormTypeInputDefinition;
