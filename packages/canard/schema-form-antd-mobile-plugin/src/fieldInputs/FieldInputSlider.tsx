import { useCallback } from 'react';

import { Slider, type SliderProps } from 'antd-mobile';

import { isArray } from '@winglet/common-utils/filter';
import { isArraySchema, isNumberSchema } from '@winglet/json-schema/filter';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<
    number | [number, number],
    NumberSchema | ArraySchema
  > {
  /** Labeled stops on the track, from `presentation.FieldInputProps.marks`. */
  marks?: SliderProps['marks'];
  /** `false` publishes on every move; otherwise only when the drag ends. */
  lazy?: boolean;
}

const FieldInputSlider = ({
  inputId,
  labelId,
  name,
  jsonSchema,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  marks,
  lazy,
  misfit,
  className,
  style,
}: FieldInputSliderProps) => {
  const range = isArraySchema(jsonSchema);
  const constraints = range ? jsonSchema.items : jsonSchema;
  const bounds =
    constraints && isNumberSchema(constraints) ? constraints : undefined;
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
        if (
          isArray(value) &&
          value.length === 2 &&
          value.every(Number.isFinite)
        )
          onChange(value);
      } else if (typeof value === 'number' && Number.isFinite(value))
        onChange(value);
    },
    [onChange, range],
  );

  return (
    <div
      className={className}
      style={style}
      id={inputId}
      role="group"
      aria-labelledby={labelId}
      aria-invalid={misfit || undefined}
    >
      <Slider
        disabled={disabled || readOnly}
        aria-label={jsonSchema.title || name}
        min={bounds?.minimum}
        max={bounds?.maximum}
        step={bounds?.multipleOf}
        range={range}
        marks={marks}
        defaultValue={initialValue}
        {...{ [lazy === false ? 'onChange' : 'onAfterChange']: handleChange }}
      />
    </div>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: ({ schemaType: type, jsonSchema, format }) => {
    return (
      ((type === 'number' || type === 'integer') && format === 'slider') ||
      (type === 'array' &&
        jsonSchema.items &&
        isNumberSchema(jsonSchema.items) &&
        format === 'slider')
    );
  },
} satisfies FieldInputDefinition;
