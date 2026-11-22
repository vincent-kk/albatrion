import { type ReactNode, useMemo, useState } from 'react';

import { Box, Slider, Typography, sliderClasses } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';
import { getSliderBounds } from './utils/slider/getSliderBounds';

interface FieldInputSliderProps
  extends FieldInputPropsWithSchema<number | null, NumberSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  showMarks?: boolean;
  hideLabel?: boolean;
  /**
   * Publish only when dragging ends if true, otherwise on every move.
   * From `presentation.FieldInputProps.lazy`.
   */
  lazy?: boolean;
  /** Accessible text for an empty field, supplied by presentation. */
  unsetValueText?: string;
}

/** Native thumb styling for a slider with no stored value. */
const UNSET_SLIDER_STYLE = {
  mt: 1,
  [`& .${sliderClasses.thumb}:not(.${sliderClasses.focusVisible}):not(.${sliderClasses.active})`]:
    {
      opacity: 0,
    },
};

const FieldInputSlider = ({
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp,
  showMarks = false,
  hideLabel,
  lazy,
  unsetValueText = 'Not set',
  misfit,
  className,
  style,
}: FieldInputSliderProps) => {
  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

  const storedValue =
    typeof defaultValue === 'number' ? defaultValue : undefined;
  const { min, max, step, initialValue, isEmpty } = useMemo(
    () => getSliderBounds(jsonSchema, storedValue),
    [jsonSchema, storedValue],
  );
  const [isUnset, setIsUnset] = useState(typeof defaultValue !== 'number');
  const handleChange = useHandle((_, value: number | number[]) => {
    if (!isEmpty && typeof value === 'number') {
      setIsUnset(false);
      onChange(value);
    }
  });
  const captionId = label ? getInputId('legend') : undefined;

  return (
    <Box className={className} style={style} sx={{ px: 2 }}>
      {label && (
        <Typography
          variant="body2"
          component="label"
          htmlFor={inputId}
          id={captionId}
          sx={{ mb: 1, display: 'block' }}
        >
          {label}
          {required && ' *'}
        </Typography>
      )}
      <Slider
        name={name}
        defaultValue={initialValue}
        min={min}
        max={max}
        step={step}
        shiftStep={step * 10}
        {...{
          [lazy === false ? 'onChange' : 'onChangeCommitted']: handleChange,
        }}
        disabled={disabled || readOnly || isEmpty}
        size={size}
        marks={showMarks}
        slotProps={{
          input: {
            id: inputId,
            'aria-labelledby': captionId ?? labelId,
            'aria-invalid': misfit || undefined,
            ...(isUnset && {
              'aria-valuenow': undefined,
              'aria-valuetext': unsetValueText,
            }),
          },
        }}
        valueLabelDisplay={isUnset ? 'off' : 'auto'}
        sx={isUnset ? UNSET_SLIDER_STYLE : { mt: 1 }}
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
