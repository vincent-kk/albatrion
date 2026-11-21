import { useCallback, useMemo, useRef, useState } from 'react';

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
  inputId,
  getInputId,
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
  labelId: labelledBy,
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
  const bounds = useMemo(
    () =>
      getSliderBounds(
        constraints.minimum ?? jsonSchema.minimum,
        constraints.maximum ?? jsonSchema.maximum,
        multipleOf,
        integer,
        constraints.exclusiveMinimum ?? jsonSchema.exclusiveMinimum,
        constraints.exclusiveMaximum ?? jsonSchema.exclusiveMaximum,
        marks,
      ),
    [constraints, jsonSchema, multipleOf, integer, marks],
  );
  const { min, max, step, empty, stops, libraryMarks } = bounds;
  const normalizeValue = useCallback(
    (value: number) => (stops.includes(value) ? value : bounds.snap(value)),
    [stops, bounds],
  );
  const initialOffGrid = useMemo(
    () =>
      Array.isArray(initialValue)
        ? initialValue.some((value) => normalizeValue(value) !== value)
        : typeof initialValue === 'number' &&
          normalizeValue(initialValue) !== initialValue,
    [initialValue, normalizeValue],
  );
  const navigationValue = useRef<number | [number, number] | undefined>(
    Array.isArray(initialValue)
      ? [Math.min(...initialValue), Math.max(...initialValue)]
      : initialValue,
  );
  const [isUnset, setIsUnset] = useState(initialValue === undefined);
  const [draft, setDraft] = useState<number | [number, number]>(() => {
    const display = readOnly ? bounds.getReadOnlyValue : normalizeValue;
    if (Array.isArray(initialValue))
      return [
        display(Math.min(...initialValue)),
        display(Math.max(...initialValue)),
      ];
    return typeof initialValue === 'number'
      ? display(initialValue)
      : range
        ? [min, min]
        : min;
  });
  const handleChange = useCallback(
    (value: number | [number, number] | null) => {
      if (empty) return;
      setIsUnset(false);
      if (value === null) onChange(undefined);
      else if (range) {
        if (isArray(value) && !value.some(Number.isNaN))
          onChange([normalizeValue(value[0]), normalizeValue(value[1])]);
      } else if (typeof value === 'number' && !Number.isNaN(value))
        onChange(normalizeValue(value));
    },
    [onChange, range, empty, normalizeValue],
  );

  const handleDraftChange = (candidate: number | [number, number]) => {
    if (empty) return;
    const value: number | [number, number] = Array.isArray(candidate)
      ? [normalizeValue(candidate[0]), normalizeValue(candidate[1])]
      : normalizeValue(candidate);
    navigationValue.current = value;
    setIsUnset(false);
    setDraft(value);
    if (lazy === false) handleChange(value);
  };

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : name}
      aria-invalid={misfit || undefined}
    >
      <SliderKeyboardControl
        inputId={inputId}
        getInputId={getInputId}
        labelledBy={labelledBy}
        value={draft}
        navigationValue={navigationValue.current ?? draft}
        unset={isUnset}
        min={min}
        max={max}
        step={step}
        stops={stops}
        navigate={bounds.keyboard}
        disabled={!!(disabled || readOnly || empty)}
        onChange={handleDraftChange}
        onChangeCommitted={lazy === false ? undefined : handleChange}
      >
        <Slider
          disabled={disabled || readOnly || empty}
          min={bounds.libraryMin}
          max={bounds.libraryMax}
          step={bounds.libraryStep}
          range={range}
          marks={libraryMarks}
          defaultValue={initialValue}
          value={
            Array.isArray(draft)
              ? [bounds.toLibrary(draft[0]), bounds.toLibrary(draft[1])]
              : bounds.toLibrary(draft)
          }
          aria-label={name}
          onChange={(value) => {
            if (value === null) {
              handleChange(null);
              return;
            }
            if (typeof value === 'number' && !Number.isFinite(value)) return;
            handleDraftChange(
              Array.isArray(value)
                ? [bounds.fromLibrary(value[0]), bounds.fromLibrary(value[1])]
                : bounds.fromLibrary(value),
            );
          }}
          onAfterChange={
            lazy === false && !isUnset && !initialOffGrid
              ? undefined
              : (value) => {
                  if (value === null) {
                    handleChange(null);
                    return;
                  }
                  if (typeof value === 'number' && !Number.isFinite(value))
                    return;
                  handleChange(
                    Array.isArray(value)
                      ? [
                          bounds.fromLibrary(value[0]),
                          bounds.fromLibrary(value[1]),
                        ]
                      : bounds.fromLibrary(value),
                  );
                }
          }
        />
      </SliderKeyboardControl>
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: isSliderInput,
} satisfies FieldInputDefinition;
