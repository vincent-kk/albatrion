import type { ReactNode } from 'react';

import type { ArraySchema, StringSchema } from '@/schema-form/types';

/** Replace items while preserving each schema union member and its named keys. */
type WithStringItems<Schema> = Schema extends unknown
  ? {
      [Key in keyof Schema]: Key extends 'items' ? StringSchema : Schema[Key];
    } & { items: StringSchema }
  : never;

/** Array schema whose items are a string schema. */
export type StringCheckboxJSONSchema = WithStringItems<ArraySchema>;

/** Form context that may relabel checkbox choices by value. */
export type CheckboxLabelsContext = {
  checkboxLabels?: {
    [label: string]: ReactNode;
  };
};
