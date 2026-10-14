import type { FieldInputDefinition } from '@/schema-form/types';

import { FieldInputUnion } from './FieldInputUnion';

/** Match every union at the ordinary string fallback's priority. */
export const FieldInputUnionDefinition = {
  Component: FieldInputUnion,
  test: { type: 'union' },
} satisfies FieldInputDefinition;
