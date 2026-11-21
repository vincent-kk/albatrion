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
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

// customParseFormat enables the strict parse below; the import does not extend dayjs by itself.
dayjs.extend(customParseFormat);

const LIMIT_FORMAT = 'YYYY-MM';

/**
 * Parses a `minimum` or `maximum` limit strictly, so an overflowing month is rejected instead of
 * rolled over (lenient dayjs reads `2024-13` as `2025-01`).
 * @param limit - Limit in `YYYY-MM` form; empty means no limit.
 * @returns The limit, or `undefined` when it is empty or not a valid `YYYY-MM` month.
 */
const parseLimit = (limit: string | undefined): Dayjs | undefined => {
  if (!limit) return undefined;
  const date = dayjs(limit, LIMIT_FORMAT, true);
  return date.isValid() ? date : undefined;
};

type MonthJSONSchema = StringSchema & {
  format: 'month';
};

interface FieldInputMonthProps
  extends FieldInputPropsWithSchema<string | null, MonthJSONSchema, MuiContext>,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  /** Earliest selectable month (YYYY-MM), from `presentation.FieldInputProps.minimum`. */
  minimum?: string;
  /** Latest selectable month (YYYY-MM), from `presentation.FieldInputProps.maximum`. */
  maximum?: string;
}

const FieldInputMonth = ({
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
}: FieldInputMonthProps) => {
  const titleId = useMeaningfulLabelId(fieldTitleId);
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
    onChange(newValue.format('YYYY-MM'));
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
        views={['year', 'month']}
        openTo="month"
        format="YYYY-MM"
        slotProps={{
          textField: {
            id: getInputId('native'),
            InputProps: {
              'aria-labelledby': titleId,
              'aria-label': fieldName,
              slotProps: {
                input: {
                  id: inputId,
                  role: 'group',
                  'aria-disabled': disabled || undefined,
                  'aria-labelledby': titleId,
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

export const FieldInputMonthDefinition = {
  Component: FieldInputMonth,
  test: ({ type, format }) => type === 'string' && format === 'month',
} satisfies FieldInputDefinition;
