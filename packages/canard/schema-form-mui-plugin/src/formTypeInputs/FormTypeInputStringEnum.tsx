import { useEffect, useMemo, useState } from 'react';

import {
  Autocomplete,
  Box,
  Chip,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

interface StringEnumJsonSchema extends StringSchema {
  enum: string[];
  enumLabels?: string[];
}

interface ArrayStringEnumJsonSchema {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
    enumLabels?: string[];
  };
}

type JsonSchema = StringEnumJsonSchema | ArrayStringEnumJsonSchema;

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<
    string | string[],
    JsonSchema,
    { size?: 'small' | 'medium' }
  > {
  size?: 'small' | 'medium';
  mode?: 'single' | 'multiple';
}

const FormTypeInputStringEnum = ({
  path,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
  mode,
}: FormTypeInputStringEnumProps) => {
  const [selectedValue, setSelectedValue] = useState<string | string[]>('');

  const { enumValues, enumLabels, isMultiple } = useMemo(() => {
    let enumValues: string[] = [];
    let enumLabels: string[] = [];
    let isMultiple = false;

    if (jsonSchema.type === 'string') {
      enumValues = jsonSchema.enum;
      enumLabels = jsonSchema.enumLabels || jsonSchema.enum;
    } else if (jsonSchema.type === 'array') {
      enumValues = jsonSchema.items.enum;
      enumLabels = jsonSchema.items.enumLabels || jsonSchema.items.enum;
      isMultiple = true;
    }

    // mode prop으로 강제 설정 가능
    if (mode) isMultiple = mode === 'multiple';

    return {
      enumValues,
      enumLabels,
      isMultiple,
    };
  }, [jsonSchema, mode]);

  const options = useMemo(
    () =>
      enumValues.map((val, index) => ({
        value: val,
        label: enumLabels[index] || val,
      })),
    [enumValues, enumLabels],
  );

  // 외부 value가 변경될 때 내부 상태 동기화
  useEffect(() => {
    if (isMultiple) {
      setSelectedValue(Array.isArray(value) ? value : []);
    } else {
      setSelectedValue(value || '');
    }
  }, [value, isMultiple]);

  const handleSingleChange = useHandle((event: any) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    onChange(newValue);
  });

  const handleMultipleChange = useHandle((_, newValue: any[]) => {
    const processedValue = newValue.map((option) =>
      typeof option === 'string' ? option : option.value,
    );
    setSelectedValue(processedValue);
    onChange(processedValue);
  });

  // 다중 선택인 경우 Autocomplete 사용
  if (isMultiple) {
    const selectedOptions = ((selectedValue as string[]) || []).map(
      (val) =>
        options.find((opt) => opt.value === val) || { value: val, label: val },
    );

    return (
      <Autocomplete
        multiple
        id={path}
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        value={selectedOptions}
        onChange={handleMultipleChange}
        disabled={disabled}
        size={size || context?.size || 'medium'}
        renderValue={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              variant="outlined"
              label={option.label}
              size="small"
              {...getTagProps({ index })}
              key={option.value}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            variant="outlined"
            placeholder="Select options..."
          />
        )}
      />
    );
  }

  // 단일 선택인 경우 Select 사용
  return (
    <Box sx={{ minWidth: 120 }}>
      <Select
        id={path}
        name={name}
        value={selectedValue || ''}
        onChange={handleSingleChange}
        disabled={disabled}
        fullWidth
        size={size || context?.size || 'medium'}
        displayEmpty
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, jsonSchema }) =>
    type === 'string' &&
    ((jsonSchema.enum && jsonSchema.enum.length > 0) ||
      (jsonSchema.type === 'array' &&
        jsonSchema.items?.type === 'string' &&
        jsonSchema.items?.enum &&
        jsonSchema.items.enum.length > 0)),
} satisfies FormTypeInputDefinition;
