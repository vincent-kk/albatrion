import { useCallback, useMemo, useState } from 'react';

import { Slider, type SliderProps } from 'antd-mobile';

import { isArray } from '@winglet/common-utils/filter';
import { isNumberSchema } from '@winglet/json-schema/filter';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import { isSliderInput } from '../utils/inputs/isSliderInput';
import { SliderKeyboardControl } from './components/SliderKeyboardControl';

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
  id,
  jsonSchema,
  name,
  type,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  marks,
  lazy,
  misfit,
  'aria-labelledby': labelledBy,
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

  const constraints =
    range && jsonSchema.items && isNumberSchema(jsonSchema.items)
      ? jsonSchema.items
      : jsonSchema;

  const min = constraints.minimum ?? jsonSchema.minimum ?? 0;
  const max = constraints.maximum ?? jsonSchema.maximum ?? 100;
  const step = constraints.multipleOf ?? jsonSchema.multipleOf ?? 1;
  const [draft, setDraft] = useState<number | [number, number]>(
    initialValue ?? (range ? [min, min] : min),
  );
  const stops = useMemo(
    () =>
      marks
        ? Object.keys(marks)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b)
        : [],
    [marks],
  );
  const handleDraftChange = (value: number | [number, number]) => {
    setDraft(value);
    if (lazy === false) handleChange(value);
  };
  const handleKeyboardChange = (value: number | [number, number]) => {
    setDraft(value);
    handleChange(value);
  };

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : name}
      aria-invalid={misfit || undefined}
    >
      <SliderKeyboardControl
        id={id}
        labelledBy={labelledBy}
        value={draft}
        min={min}
        max={max}
        step={step}
        stops={stops}
        disabled={!!(disabled || readOnly)}
        onChange={handleKeyboardChange}
      >
        <Slider
          disabled={disabled || readOnly}
          min={min}
          max={max}
          step={step}
          range={range}
          marks={marks}
          defaultValue={initialValue}
          value={draft}
          aria-label={name}
          onChange={handleDraftChange}
          onAfterChange={lazy === false ? undefined : handleChange}
        />
      </SliderKeyboardControl>
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: isSliderInput,
} satisfies FieldInputDefinition;
