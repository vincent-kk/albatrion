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

const FieldInputSlider = ({
  id,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  lazy,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputSliderProps) => {
  // Ant Design exposes handle ARIA props, but its public id targets the slider root.
  const markFocusTarget = useCallback(
    (group: HTMLDivElement | null) => {
      const handle = group?.querySelector<HTMLElement>('[role="slider"]');
      if (handle) {
        handle.id = id;
        handle.setAttribute('data-focus-target', '');
        if (labelledBy) handle.setAttribute('aria-labelledby', labelledBy);
      }
    },
    [id, labelledBy],
  );
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
        ariaLabelledByForHandle={labelledBy}
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
