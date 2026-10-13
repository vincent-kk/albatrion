import { useCallback, useMemo } from 'react';

import { Slider } from 'antd';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FormTypeInputSliderProps
  extends FormTypeInputPropsWithSchema<number | null, NumberSchema> {
  /**
   * `false` publishes on every move; otherwise only when the drag ends.
   * From `presentation.FormTypeInputProps.lazy`.
   */
  lazy?: boolean;
}

const FormTypeInputSlider = ({
  path,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  lazy,
}: FormTypeInputSliderProps) => {
  const handleChange = useCallback(
    (value: number | null) => {
      if (value === null) onChange(NaN);
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
        : { onChangeComplete: handleChange }),
    } as const;
  }, [handleChange, jsonSchema, lazy]);

  return (
    <Slider
      id={path}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue ?? undefined}
      {...changeHandler}
    />
  );
};

export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: {
    schemaType: ['number', 'integer'],
    formType: 'slider',
  },
} satisfies FormTypeInputDefinition;
