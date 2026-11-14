import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputDateFormat } from './FieldInputDateFormat';

/** Built-in date input; matches strings whose format is a native date input type. */
export const FieldInputDateFormatDefinition = {
  Component: FieldInputDateFormat,
  test: {
    type: 'string',
    format: ['month', 'week', 'date', 'time', 'datetime-local'],
  },
} satisfies FieldInputDefinition;
