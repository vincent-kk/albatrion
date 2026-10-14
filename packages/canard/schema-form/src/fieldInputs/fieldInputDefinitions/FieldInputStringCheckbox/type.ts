import type { ReactNode } from 'react';

import type { BaseArraySchema, BaseStringSchema } from '@/schema-form/types';

/** Array schema whose items are a string schema. */
export type StringCheckboxJSONSchema = {
  items: BaseStringSchema;
} & BaseArraySchema;

/** Form context that may relabel checkbox choices by value. */
export type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};
