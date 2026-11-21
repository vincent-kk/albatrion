import { type ReactNode, useMemo } from 'react';

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

type TimeJSONSchema = StringSchema & {
  format: 'time';
  ampm?: boolean;
};

interface FieldInputTimeProps
  extends FieldInputPropsWithSchema<string | null, TimeJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  ampm?: boolean;
  hideLabel?: boolean;
}

const FieldInputTime = ({
  inputId,
  getInputId,
  labelId: fieldTitleId,
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
  variant: variantProp,
  fullWidth: fullWidthProp,
  ampm: ampmProp,
  hideLabel,
  misfit,
}: FieldInputTimeProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size, variant, fullWidth, ampm] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
        ampmProp ?? jsonSchema.ampm,
      ];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
      ampmProp ?? jsonSchema.ampm,
    ];
  }, [
    jsonSchema,
    context,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    ampmProp,
    hideLabel,
  ]);

  const timeValue = useMemo(() => {
    if (typeof defaultValue !== 'string' || !defaultValue) return null;

    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(`${today}T${defaultValue}`);
  }, [defaultValue]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue === null) {
      onChange(undefined);
      return;
    }
    if (!newValue.isValid()) return;
    onChange(newValue.format('HH:mm:ss'));
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        defaultValue={timeValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        ampm={ampm}
        slotProps={{
          textField: {
            id: getInputId('native'),
            InputProps: {
              'aria-labelledby': fieldTitleId,
              'aria-label': fieldName,
              slotProps: {
                input: {
                  id: inputId,
                  role: 'group',
                  'aria-disabled': disabled || undefined,
                  'aria-labelledby': fieldTitleId,
                  'aria-label': fieldName,
                },
              },
            },
            name,
            required,
            size,
            variant,
            fullWidth,
            error: misfit,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const FieldInputTimeDefinition = {
  Component: FieldInputTime,
  test: ({ type, format }) => type === 'string' && format === 'time',
} satisfies FieldInputDefinition;
