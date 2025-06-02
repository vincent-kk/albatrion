import { Box, Slider, Typography } from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  NumberSchema,
} from '@canard/schema-form';

interface SliderJsonSchema extends NumberSchema {
  formType: 'slider';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  lazy?: boolean; // onChange vs onChangeCommitted 선택
}

interface FormTypeInputSliderProps
  extends FormTypeInputPropsWithSchema<
    number,
    SliderJsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  showValue?: boolean;
  showMarks?: boolean;
}

const FormTypeInputSlider = ({
  path,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
  showValue = true,
  showMarks = false,
}: FormTypeInputSliderProps) => {
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

  const sliderValue = typeof value === 'number' ? value : min;

  return (
    <Box sx={{ px: 2 }}>
      {showValue && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Value: {sliderValue}
        </Typography>
      )}

      <Slider
        id={path}
        name={name}
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        disabled={disabled}
        size={size || context?.size || 'medium'}
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
