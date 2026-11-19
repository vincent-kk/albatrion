import { useCallback, useMemo, useRef, useState } from 'react';

import { Slider } from 'antd';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { getSliderBounds } from './utils/slider/getSliderBounds';

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
  const [isUnset, setIsUnset] = useState(typeof defaultValue !== 'number');
  const currentValue = useRef(
    typeof defaultValue === 'number' ? defaultValue : undefined,
  );

  // Ant Design exposes handle ARIA props, but its public id targets the slider root.
  const markFocusTarget = useCallback(
    (group: HTMLDivElement | null) => {
      const handle = group?.querySelector<HTMLElement>('[role="slider"]');
      if (handle) {
        handle.id = id;
        handle.setAttribute('data-focus-target', '');
        if (labelledBy) handle.setAttribute('aria-labelledby', labelledBy);
        if (isUnset) {
          handle.removeAttribute('aria-valuenow');
          handle.setAttribute('aria-valuetext', 'Not set');
          handle.style.opacity = handle === document.activeElement ? '1' : '0';
        } else {
          handle.setAttribute('aria-valuenow', String(currentValue.current));
          handle.removeAttribute('aria-valuetext');
          handle.style.opacity = '';
        }
      }
    },
    [id, labelledBy, isUnset],
  );
  const handleChange = useCallback(
    (value: number | null) => {
      if (disabled || readOnly) return;
      if (value === null) {
        currentValue.current = undefined;
        setIsUnset(true);
        onChange(undefined);
      } else if (!Number.isNaN(value)) {
        currentValue.current = value;
        setIsUnset(false);
        onChange(value);
      }
    },
    [onChange, disabled, readOnly],
  );

  const { min, max, step, ...changeHandler } = useMemo(() => {
    return {
      ...getSliderBounds(
        jsonSchema.minimum,
        jsonSchema.maximum,
        jsonSchema.multipleOf,
      ),
      ...(lazy === false
        ? {
            onChange: handleChange,
            ...(isUnset ? { onChangeComplete: handleChange } : {}),
          }
        : { onChangeComplete: handleChange }),
    } as const;
  }, [handleChange, jsonSchema, lazy, isUnset]);

  return (
    <div
      ref={markFocusTarget}
      role="group"
      aria-labelledby={labelledBy}
      aria-invalid={misfit || undefined}
      onKeyDown={(event) => {
        if (
          typeof currentValue.current === 'number' ||
          !(event.target instanceof HTMLElement) ||
          event.target.getAttribute('role') !== 'slider'
        )
          return;
        if (event.key === 'Home') handleChange(min);
        else if (event.key === 'End') handleChange(max);
      }}
    >
      <Slider
        ariaLabelledByForHandle={labelledBy}
        onFocus={(event) => {
          if (isUnset) event.currentTarget.style.opacity = '1';
        }}
        onBlur={(event) => {
          if (isUnset) event.currentTarget.style.opacity = '0';
        }}
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
