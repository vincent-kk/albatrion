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
import { getSliderBounds } from './utils/slider/getSliderBounds';

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
  const constraints =
    range && jsonSchema.items && isNumberSchema(jsonSchema.items)
      ? jsonSchema.items
      : jsonSchema;
  const multipleOf = constraints.multipleOf ?? jsonSchema.multipleOf;
  const integer = Array.isArray(constraints.type)
    ? constraints.type.includes('integer')
    : constraints.type === 'integer';
  const { min, max, step, empty } = useMemo(
    () =>
      getSliderBounds(
        constraints.minimum ?? jsonSchema.minimum,
        constraints.maximum ?? jsonSchema.maximum,
        multipleOf,
        integer,
      ),
    [constraints, jsonSchema, multipleOf, integer],
  );
  const [isUnset, setIsUnset] = useState(initialValue === undefined);
  const handleChange = useCallback(
    (value: number | [number, number] | null) => {
      if (empty) return;
      setIsUnset(false);
      if (value === null) onChange(undefined);
      else if (range) {
        if (isArray(value) && !value.some(Number.isNaN)) onChange(value);
      } else if (typeof value === 'number' && !Number.isNaN(value))
        onChange(value);
    },
    [onChange, range, empty],
  );

  const [draft, setDraft] = useState<number | [number, number]>(
    initialValue ?? (range ? [min, min] : min),
  );
  const validMarks = useMemo(
    () =>
      marks &&
      Object.fromEntries(
        Object.entries(marks).filter(([key]) => {
          const value = Number(key);
          return (
            Number.isFinite(value) &&
            value >= min &&
            value <= max &&
            (!integer || Number.isInteger(value)) &&
            (multipleOf === undefined ||
              Math.abs(value / step - Math.round(value / step)) < 1e-9)
          );
        }),
      ),
    [marks, min, max, step, integer, multipleOf],
  );
  const stops = useMemo(
    () =>
      validMarks
        ? Object.keys(validMarks)
            .map(Number)
            .sort((a, b) => a - b)
        : [],
    [validMarks],
  );
  const handleDraftChange = (value: number | [number, number]) => {
    if (empty) return;
    setIsUnset(false);
    setDraft(value);
    if (lazy === false) handleChange(value);
  };
  const handleKeyboardChange = (value: number | [number, number]) => {
    if (empty) return;
    setIsUnset(false);
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
        unset={isUnset}
        min={min}
        max={max}
        step={step}
        stops={stops}
        disabled={!!(disabled || readOnly || empty)}
        onChange={handleKeyboardChange}
      >
        <Slider
          disabled={disabled || readOnly || empty}
          min={min}
          max={max}
          step={step}
          range={range}
          marks={validMarks}
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
