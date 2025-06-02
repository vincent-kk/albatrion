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
  showMarks?: boolean;
}

const FormTypeInputSlider = ({
  path,
  name,
  jsonSchema,
  disabled,
  defaultValue,
  onChange,
  context,
  size,
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

  return (
    <Box sx={{ px: 2 }}>
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
        size={size || context?.size}
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
