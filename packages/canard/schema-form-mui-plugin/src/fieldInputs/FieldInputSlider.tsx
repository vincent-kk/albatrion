import type { ReactNode } from 'react';

import { Box, Slider, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

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
}

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

  const min = jsonSchema.minimum ?? 0;
  const max = jsonSchema.maximum ?? 100;
  const step = jsonSchema.multipleOf ?? 1;
  const handleChange = useHandle((_, value: number | number[]) => {
    if (typeof value === 'number') onChange(value);
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
        defaultValue={typeof defaultValue === 'number' ? defaultValue : min}
        min={min}
        max={max}
        step={step}
        shiftStep={step * 10}
        {...{
          [lazy === false ? 'onChange' : 'onChangeCommitted']: handleChange,
        }}
        disabled={disabled || readOnly}
        size={size}
        marks={showMarks}
        slotProps={{
          input: {
            id: inputId,
            'aria-labelledby': captionId ?? labelId,
            'aria-invalid': misfit || undefined,
          },
        }}
        valueLabelDisplay="auto"
        sx={{ mt: 1 }}
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
