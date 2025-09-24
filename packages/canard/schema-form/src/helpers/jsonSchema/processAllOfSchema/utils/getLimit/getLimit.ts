import type { JsonSchema } from '@/schema-form/types';

export const getLimit = (type: JsonSchema['type']) =>
  type === 'object' ? 3 : type === 'array' ? 2 : 1;
