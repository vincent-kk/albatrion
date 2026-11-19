import { type ReactNode, useMemo, useState } from 'react';

import { Box, Slider, Typography, sliderClasses } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getSliderBounds } from './utils/slider/getSliderBounds';

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
   * Publish only when dragging ends if true, otherwise on every move.
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
  [`& .${sliderClasses.thumb}:not(.${sliderClasses.focusVisible})`]: {
    opacity: 0,
  },
};

const FieldInputSlider = ({
  inputId,
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
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || name, sizeProp || context.size];
  }, [context, labelProp, name, sizeProp, hideLabel]);

  const { min, max, step, empty } = useMemo(
    () =>
      getSliderBounds(
        jsonSchema.minimum,
        jsonSchema.maximum,
        jsonSchema.multipleOf,
        Array.isArray(jsonSchema.type)
          ? jsonSchema.type.includes('integer')
          : jsonSchema.type === 'integer',
      ),
    [jsonSchema],
  );
  const isLazy = lazy ?? false;

  // An external value change remounts this input, so a reset to undefined starts unset again.
  const [isUnset, setIsUnset] = useState(typeof defaultValue !== 'number');

  const handleChange = useHandle((_, newValue: number | number[]) => {
    if (empty) return;
    if (isUnset) setIsUnset(false);
    if (!isLazy) {
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    }
  });

  const handleChangeCommitted = useHandle((_, newValue: number | number[]) => {
    if (empty) return;
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    // MUI skips onChange for an unchanged value, so Home or a release on the minimum arrives only here.
    if (isUnset) {
      setIsUnset(false);
      onChange(value);
    } else if (isLazy) {
      onChange(value);
    }
  });

  return (
    <Box sx={{ px: 2 }}>
      {label && (
        <Typography
          variant="body2"
          component="label"
          htmlFor={inputId}
          sx={{ mb: 1, display: 'block' }}
        >
          {label}
          {required && ' *'}
        </Typography>
      )}
      <Slider
        name={name}
        defaultValue={typeof defaultValue === 'number' ? defaultValue : min}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        disabled={disabled || readOnly || empty}
        size={size}
        marks={showMarks}
        slotProps={{
          input: isUnset
            ? {
                id: inputId,
                'aria-invalid': misfit || undefined,
                'aria-valuenow': undefined,
                'aria-valuetext': unsetValueText,
              }
            : { id: inputId, 'aria-invalid': misfit || undefined },
        }}
        valueLabelDisplay={isUnset ? 'off' : 'auto'}
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
