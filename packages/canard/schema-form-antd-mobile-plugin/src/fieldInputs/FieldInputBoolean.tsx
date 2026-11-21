import { useMemo } from 'react';

import { Checkbox } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useNativeFieldName } from '../utils/useNativeFieldName';
import { useOwnedControlName } from '../utils/useOwnedControlName';
import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';

const FieldInputBoolean = ({
  inputId,
  jsonSchema,
  name,
  disabled,
  value,
  onChange,
  misfit,
  labelId: labelledBy,
}: FieldInputProps<boolean | null>) => {
  const titleId = useMeaningfulLabelId(labelledBy);
  const fieldName = useFieldNameFallback(jsonSchema, name);
  const naming = useNativeFieldName(inputId, labelledBy, fieldName);
  useOwnedControlName(inputId, naming);
  const bindControls = useControlIdentifiers(
    inputId,
    undefined,
    'input[type="checkbox"]',
  );
  const [indeterminate, checked] = useMemo(
    () => [value !== undefined && typeof value !== 'boolean', value ?? false],
    [value],
  );
  const handleChange = useHandle(onChange);
  return (
    <div
      ref={bindControls}
      role="group"
      aria-labelledby={titleId}
      aria-label={fieldName}
      aria-invalid={misfit || undefined}
    >
      <Checkbox
        id={inputId}
        disabled={disabled}
        indeterminate={indeterminate}
        checked={checked}
        onChange={handleChange}
        style={{
          '--icon-size': '24px',
          '--font-size': '20px',
        }}
      />
    </div>
  );
};

export const FieldInputBooleanDefinition = {
  Component: FieldInputBoolean,
  controlled: true,
  test: {
    type: 'boolean',
  },
} satisfies FieldInputDefinition;
