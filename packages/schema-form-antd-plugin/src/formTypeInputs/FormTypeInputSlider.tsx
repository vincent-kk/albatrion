import { useCallback, useMemo } from 'react';

import { Slider } from 'antd';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@lumy-pack/schema-form';

const FormTypeInputSlider = ({
  path,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
}: FormTypeInputPropsWithSchema<number, NumberSchema>) => {
  const handleChange = useCallback(
    (value: number | null) => {
      if (value === null) onChange(undefined);
      else onChange(value);
    },
    [onChange],
  );

  const { min, max, step, ...changeHandler } = useMemo(() => {
    return {
      min: jsonSchema.minimum,
      max: jsonSchema.maximum,
      step: jsonSchema.multipleOf,
      ...(jsonSchema.renderOptions?.lazy === false
        ? { onChange: handleChange }
        : { onAfterChange: handleChange }),
    } as const;
  }, [handleChange, jsonSchema]);

  return (
    <Slider
      id={path}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue}
      {...changeHandler}
    />
  );
};

export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: {
    type: ['number', 'integer'],
    formType: 'slider',
  },
} satisfies FormTypeInputDefinition;
