import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { SliderKeyboardControl } from './components/SliderKeyboardControl';
import { getSliderBounds } from './utils/slider/getSliderBounds';
import { getSliderDisplayValue } from './utils/slider/getSliderDisplayValue';

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
  const titleId = useMeaningfulLabelId(labelledBy);
  const fieldName = useFieldNameFallback(jsonSchema, name);
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
  const [stored, setStored] = useState<number | [number, number] | undefined>(
    () =>
      Array.isArray(initialValue)
        ? [Math.min(...initialValue), Math.max(...initialValue)]
        : initialValue,
  );
  const pointer = useRef<'idle' | 'active' | 'canceled'>('idle');
  const [pendingDraft, setPendingDraft] = useState<number | [number, number]>();
  const locked = !!(disabled || readOnly || empty);
  const activeDraft = locked ? undefined : pendingDraft;
  const normalizeDisplay = readOnly ? bounds.getReadOnlyValue : normalizeValue;
  const displayed: number | [number, number] = range
    ? [
        getSliderDisplayValue(
          Array.isArray(stored) ? stored[0] : undefined,
          Array.isArray(activeDraft) ? activeDraft[0] : undefined,
          min,
          normalizeDisplay,
          locked,
        ),
        getSliderDisplayValue(
          Array.isArray(stored) ? stored[1] : undefined,
          Array.isArray(activeDraft) ? activeDraft[1] : undefined,
          min,
          normalizeDisplay,
          locked,
        ),
      ]
    : getSliderDisplayValue(
        typeof stored === 'number' ? stored : undefined,
        typeof activeDraft === 'number' ? activeDraft : undefined,
        min,
        normalizeDisplay,
        locked,
      );
  const isUnset = stored === undefined && activeDraft === undefined;
  useLayoutEffect(() => {
    if (!locked) return;
    if (pointer.current === 'active') pointer.current = 'canceled';
    setPendingDraft(undefined);
  }, [locked]);

  const beginPointer = () => {
    if (!locked) pointer.current = 'active';
  };
  const handleChange = (value: number | [number, number] | null) => {
    if (locked) return;
    if (value === null) {
      setStored(undefined);
      setPendingDraft(undefined);
      onChange(undefined);
    } else if (range) {
      if (isArray(value) && value.every(Number.isFinite)) {
        const normalized: [number, number] = [
          normalizeValue(value[0]),
          normalizeValue(value[1]),
        ];
        setStored(normalized);
        setPendingDraft(undefined);
        onChange(normalized);
      }
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      const normalized = normalizeValue(value);
      setStored(normalized);
      setPendingDraft(undefined);
      onChange(normalized);
    }
  };

  const handleDraftChange = (candidate: number | [number, number]) => {
    if (locked) return;
    const value: number | [number, number] = Array.isArray(candidate)
      ? [normalizeValue(candidate[0]), normalizeValue(candidate[1])]
      : normalizeValue(candidate);
    if (lazy === false) handleChange(value);
    else setPendingDraft(value);
  };

  return (
    <div
      role="group"
      onMouseDownCapture={beginPointer}
      onTouchStartCapture={beginPointer}
      aria-labelledby={titleId}
      aria-label={fieldName}
      aria-invalid={misfit || undefined}
    >
      <SliderKeyboardControl
        inputId={inputId}
        getInputId={getInputId}
        labelledBy={titleId}
        value={displayed}
        navigationValue={activeDraft ?? stored ?? displayed}
        unset={isUnset}
        min={min}
        max={max}
        step={step}
        stops={stops}
        navigate={bounds.keyboard}
        disabled={locked}
        onChange={handleDraftChange}
        onChangeCommitted={lazy === false ? undefined : handleChange}
      >
        <Slider
          disabled={locked}
          min={bounds.libraryMin}
          max={bounds.libraryMax}
          step={bounds.libraryStep}
          range={range}
          marks={libraryMarks}
          defaultValue={initialValue}
          value={
            Array.isArray(displayed)
              ? [bounds.toLibrary(displayed[0]), bounds.toLibrary(displayed[1])]
              : bounds.toLibrary(displayed)
          }
          aria-label={fieldName}
          onChange={(value) => {
            if (pointer.current === 'canceled') return;
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
                  if (pointer.current === 'canceled') return;
                  pointer.current = 'idle';
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
