import { type ReactNode, useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

// customParseFormat enables the strict parse below; the import does not extend dayjs by itself.
dayjs.extend(customParseFormat);

const LIMIT_FORMAT = 'YYYY-MM-DD';

/**
 * Parses a `minimum` or `maximum` limit strictly, so an overflowing date is rejected instead of
 * rolled over (lenient dayjs reads `2024-02-31` as `2024-03-02`).
 * @param limit - Limit in `YYYY-MM-DD` form; empty means no limit.
 * @returns The limit, or `undefined` when it is empty or not a valid `YYYY-MM-DD` date.
 */
const parseLimit = (limit: string | undefined): Dayjs | undefined => {
  if (!limit) return undefined;
  const date = dayjs(limit, LIMIT_FORMAT, true);
  return date.isValid() ? date : undefined;
};

type DateJSONSchema = StringSchema & {
  format: 'date';
};

interface FieldInputDateProps
  extends FieldInputPropsWithSchema<string | null, DateJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  /** Earliest selectable date (YYYY-MM-DD), from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest selectable date (YYYY-MM-DD), from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
}

const FieldInputDate = ({
  inputId,
  getInputId,
  labelId: fieldTitleId,
  name,
  required,
  disabled,
  readOnly,
  defaultValue,
  onChange,
  context,
  jsonSchema,
  label: labelProp,
  size: sizeProp,
  variant: variantProp,
  fullWidth: fullWidthProp,
  hideLabel,
  misfit,
  minimum,
  maximum,
}: FieldInputDateProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const [label, size, variant, fullWidth] = useMemo(() => {
    if (hideLabel)
      return [
        undefined,
        sizeProp || context.size,
        variantProp || context.variant,
        fullWidthProp ?? context.fullWidth,
      ];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
      variantProp || context.variant,
      fullWidthProp ?? context.fullWidth,
    ];
  }, [
    context,
    jsonSchema,
    labelProp,
    name,
    sizeProp,
    variantProp,
    fullWidthProp,
    hideLabel,
  ]);

  const { minDate, maxDate } = useMemo(() => {
    return {
      minDate: parseLimit(minimum),
      maxDate: parseLimit(maximum),
    };
  }, [minimum, maximum]);

  const handleChange = useHandle((newValue: Dayjs | null) => {
    if (newValue === null) {
      onChange(undefined);
      return;
    }
    if (!newValue.isValid()) return;
    onChange(newValue.format('YYYY-MM-DD'));
  });

  const disableDate = useHandle((date: Dayjs) => {
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        defaultValue={
          typeof defaultValue === 'string' && defaultValue
            ? dayjs(defaultValue)
            : null
        }
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        minDate={minDate}
        maxDate={maxDate}
        shouldDisableDate={disableDate}
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

export const FieldInputDateDefinition = {
  Component: FieldInputDate,
  test: ({ type, format }) => type === 'string' && format === 'date',
} satisfies FieldInputDefinition;
