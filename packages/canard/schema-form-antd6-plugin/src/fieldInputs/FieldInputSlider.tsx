import { useCallback, useMemo, useRef } from 'react';

import { Slider } from 'antd';

import { useOnMountLayout } from '@winglet/react-utils/hook';

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
  path,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  lazy,
  misfit,
}: FieldInputSliderProps) => {
  const groupRef = useRef<HTMLDivElement>(null);
  // Slider passes no props to its handle, so the marker that lets `focus(path)` reach it is set on the DOM.
  useOnMountLayout(() => {
    groupRef.current
      ?.querySelector('[role="slider"]')
      ?.setAttribute('data-focus-target', '');
  });

  const handleChange = useCallback(
    (value: number | null) => {
      if (value === null) onChange(undefined);
      else if (!Number.isNaN(value)) onChange(value);
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
    <div ref={groupRef} role="group" aria-invalid={misfit || undefined}>
      <Slider
        id={path}
        disabled={disabled || readOnly}
        min={min}
        max={max}
        step={step}
        defaultValue={
          typeof defaultValue === 'number' ? defaultValue : undefined
        }
        {...changeHandler}
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
