import { type ReactNode, useMemo } from 'react';

import { Box, Slider, Typography, sliderClasses } from '@mui/material';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';
import { getSliderBounds } from './utils/slider/getSliderBounds';
import { useSliderControl } from './utils/slider/useSliderControl';

type SliderJSONSchema = NumberSchema & {
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
};

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<
      number | null,
      SliderJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  showMarks?: boolean;
  hideLabel?: boolean;
  /**
   * Publish on commit when omitted or true; false publishes on every move.
   * From `presentation.FieldInputProps.lazy`.
   */
  lazy?: boolean;
  /**
   * Announced as `aria-valuetext` while the form holds no value, in place of the minimum the
   * thumb rests on. From `presentation.FieldInputProps.unsetValueText`; defaults to `Not set`.
   */
  unsetValueText?: string;
}

const DEFAULT_UNSET_VALUE_TEXT = 'Not set';

/** Slider styles while the form holds a value. */
const SLIDER_SX = { mt: 1 };

/**
 * Slider styles while the form holds no value: the thumb, which MUI places at the minimum,
 * stays hidden unless it has keyboard focus, so the minimum is not shown as a stored value.
 */
const UNSET_SLIDER_SX = {
  mt: 1,
  [`& .${sliderClasses.valueLabel}`]: { display: 'none' },
  [`& .${sliderClasses.thumb}:not(.${sliderClasses.focusVisible})`]: {
    opacity: 0,
  },
};

const FieldInputSlider = ({
  inputId,
  labelId: fieldTitleId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  showMarks = false,
  hideLabel,
  lazy,
  unsetValueText = DEFAULT_UNSET_VALUE_TEXT,
  misfit,
}: FieldInputSliderProps) => {
  const titleId = useMeaningfulLabelId(fieldTitleId);
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
    ];
  }, [context, jsonSchema, labelProp, name, sizeProp, hideLabel]);

  const bounds = useMemo(
    () =>
      getSliderBounds(
        jsonSchema.minimum,
        jsonSchema.maximum,
        jsonSchema.multipleOf,
        Array.isArray(jsonSchema.type)
          ? jsonSchema.type.includes('integer')
          : jsonSchema.type === 'integer',
        jsonSchema.exclusiveMinimum,
        jsonSchema.exclusiveMaximum,
      ),
    [jsonSchema],
  );
  const { min, max, empty } = bounds;
  const {
    unset: isUnset,
    needsCommit,
    draft,
    change,
    complete,
    beginPointer,
    keyDown,
    keyUp,
  } = useSliderControl(
    bounds,
    defaultValue,
    lazy,
    disabled || readOnly,
    readOnly,
    onChange,
  );
  const handleChange = (_event: Event, value: number | number[]) =>
    change(Array.isArray(value) ? value[0] : value);
  const handleChangeCommitted = (_event: unknown, value: number | number[]) => {
    complete(
      Array.isArray(value) ? value[0] : value,
      lazy !== false || needsCommit,
    );
  };
  return (
    <Box
      sx={{ px: 2 }}
      onMouseDownCapture={beginPointer}
      onTouchStartCapture={beginPointer}
      onKeyDownCapture={keyDown}
      onKeyUpCapture={keyUp}
    >
      {label && (
        <Typography
          variant="body2"
          component="label"
          htmlFor={inputId}
          sx={{ mb: 1, display: 'block' }}
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </Typography>
      )}
      <Slider
        name={name}
        value={bounds.toLibrary(draft)}
        min={bounds.libraryMin}
        max={bounds.libraryMax}
        step={bounds.libraryStep}
        valueLabelFormat={() => (isUnset ? null : String(draft))}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        disabled={disabled || readOnly || empty}
        size={size}
        marks={showMarks}
        slotProps={{
          input: isUnset
            ? {
                id: inputId,
                'aria-labelledby': titleId,
                'aria-label': fieldName,
                'aria-valuemin': min,
                'aria-valuemax': max,

                'aria-invalid': misfit || undefined,
                'aria-valuenow': undefined,
                'aria-valuetext': unsetValueText,
              }
            : {
                id: inputId,
                'aria-labelledby': titleId,
                'aria-label': fieldName,
                'aria-valuemin': min,
                'aria-valuemax': max,
                'aria-invalid': misfit || undefined,
                'aria-valuenow': draft,
                'aria-valuetext': undefined,
              },
        }}
        valueLabelDisplay="auto"
        sx={isUnset ? UNSET_SLIDER_SX : SLIDER_SX}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {min}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {max}
        </Typography>
      </Box>
    </Box>
  );
};

export const FieldInputSliderDefinition = {
  Component: FieldInputSlider,
  test: ({ schemaType: type, inputType }) =>
    (type === 'number' || type === 'integer') && inputType === 'slider',
} satisfies FieldInputDefinition;
