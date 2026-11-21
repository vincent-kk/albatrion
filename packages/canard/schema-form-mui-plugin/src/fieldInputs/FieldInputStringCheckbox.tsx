import { type ReactNode, useMemo } from 'react';

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@mui/material';

import { isArray } from '@winglet/common-utils/filter';
import { isStringSchema } from '@winglet/json-schema/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { getEnumOptions } from './utils/enum/getEnumOptions';
import { getMuiFieldPresentation } from './utils/presentation/getMuiFieldPresentation';

type StringCheckboxJSONSchema = ArraySchema & {
  type: 'array';
  items: StringSchema;
};

interface FieldInputStringCheckboxProps
  extends FieldInputPropsWithSchema<
      Array<string | null>,
      StringCheckboxJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  alias?: Record<string, string>;
  row?: boolean;
  hideLabel?: boolean;
}

const FieldInputStringCheckbox = ({
  inputId,
  labelId,
  getInputId,
  name,
  jsonSchema,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  label: labelProp,
  alias,
  size: sizeProp,
  row = true,
  hideLabel,
  misfit,
}: FieldInputStringCheckboxProps) => {
  const [label, size] = getMuiFieldPresentation(
    labelProp,
    name,
    hideLabel,
    { size: sizeProp },
    context,
  );

  const values = jsonSchema.items.enum;
  const options = useMemo(
    () => getEnumOptions(values, alias, getInputId),
    [values, alias, getInputId],
  );
  const handleToggle = useHandle((option: string | null, checked: boolean) => {
    onChange((previous) => {
      const stored = isArray(previous) ? previous : [];
      if (!checked) return stored.filter((value) => value !== option);
      return stored.includes(option) ? stored : [...stored, option];
    });
  });

  const captionId = label ? getInputId('legend') : undefined;
  const locked = disabled || readOnly;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {label && (
        <FormLabel component="span" id={captionId} required={required}>
          {label}
        </FormLabel>
      )}
      <FormGroup
        id={inputId}
        row={row}
        role="group"
        aria-labelledby={captionId ?? labelId}
        aria-invalid={misfit || undefined}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            disabled={locked}
            control={
              <Checkbox
                id={option.id}
                name={name}
                size={size}
                checked={isArray(value) && value.includes(option.rawValue)}
                onChange={(event) =>
                  handleToggle(option.rawValue, event.target.checked)
                }
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  controlled: true,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'array' &&
    inputType === 'checkbox' &&
    isStringSchema(jsonSchema.items) &&
    !!jsonSchema.items?.enum?.length,
} satisfies FieldInputDefinition;
