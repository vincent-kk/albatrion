import { useMemo } from 'react';

import { Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useNativeFieldName } from '../utils/useNativeFieldName';

const FieldInputBoolean = ({
  inputId,
  labelId,
  jsonSchema,
  name,
  disabled,
  value,
  onChange,
  misfit,
}: FieldInputProps<boolean | null>) => {
  const naming = useNativeFieldName(
    inputId,
    labelId,
    useFieldNameFallback(jsonSchema, name),
  );
  const [indeterminate, checked] = useMemo(
    () => [
      value !== undefined && typeof value !== 'boolean',
      value ?? undefined,
    ],
    [value],
  );
  const handleChange = useHandle((event: CheckboxChangeEvent) => {
    onChange(!!event.target.checked);
  });
  return (
    <Checkbox
      aria-invalid={misfit || undefined}
      id={inputId}
      {...naming}
      name={name}
      disabled={disabled}
      indeterminate={indeterminate}
      checked={checked}
      onChange={handleChange}
    />
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  controlled: true,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
