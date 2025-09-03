import { type ReactNode, useMemo } from 'react';

import { Box, Slider, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';

type SliderJsonSchema = NumberSchema & {
  formType: 'slider';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  lazy?: boolean; // onChange vs onChangeCommitted 선택
};

interface FormTypeInputSliderProps
  extends FormTypeInputPropsWithSchema<number, SliderJsonSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  showMarks?: boolean;
  hideLabel?: boolean;
}

const FormTypeInputSlider = ({
  path,
  name,
  jsonSchema,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  label: labelProp,
  size: sizeProp = 'medium',
  showMarks = false,
  hideLabel,
}: FormTypeInputSliderProps) => {
  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [labelProp || jsonSchema.label || name, sizeProp || context.size];
  }, [jsonSchema, context, labelProp, name, sizeProp, hideLabel]);

  const min = jsonSchema.minimum ?? 0;
  const max = jsonSchema.maximum ?? 100;
  const step = jsonSchema.multipleOf ?? 1;
  const isLazy = jsonSchema.lazy ?? false;

  const handleChange = useHandle((_, newValue: number | number[]) => {
    if (!isLazy) {
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    }
  });

  const handleChangeCommitted = useHandle((_, newValue: number | number[]) => {
    if (isLazy) {
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    }
  });

  return (
    <Box sx={{ px: 2 }}>
      {label && (
        <Typography
          variant="body2"
          component="label"
          htmlFor={path}
          sx={{ mb: 1, display: 'block' }}
        >
          {label}
          {required && ' *'}
        </Typography>
      )}
      <Slider
        id={path}
        name={name}
        defaultValue={typeof defaultValue === 'number' ? defaultValue : min}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        disabled={disabled}
        size={size}
        marks={showMarks}
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

export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ type, formType }) =>
    (type === 'number' || type === 'integer') && formType === 'slider',
} satisfies FormTypeInputDefinition;
