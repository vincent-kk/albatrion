import { useCallback, useMemo } from 'react';

import { Slider } from 'antd';

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

/**
 * Marks the slider handle as the element `focus(path)` moves focus to.
 * Slider passes no props to its handle, so the marker is set on the DOM once the group mounts.
 * @param group - The group element around the Slider, or `null` when it unmounts.
 */
const markFocusTarget = (group: HTMLDivElement | null) => {
  group
    ?.querySelector('[role="slider"]')
    ?.setAttribute('data-focus-target', '');
};

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
    <div ref={markFocusTarget} role="group" aria-invalid={misfit || undefined}>
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
