import type { ReactNode } from 'react';

import type { ArraySchema, StringSchema } from '@/schema-form/types';

/** Array schema whose items are a string schema. */
export type StringCheckboxJSONSchema = {
  items: StringSchema;
} & ArraySchema;

/** Form context that may relabel checkbox choices by value. */
export type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};
