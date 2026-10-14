import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputString } from './FieldInputString';

export { FieldInputString } from './FieldInputString';

/** Match the ordinary string fallback after more specific definitions. */
export const FieldInputStringDefinition = {
  Component: FieldInputString,
  test: { type: 'string' },
} satisfies FieldInputDefinition;
