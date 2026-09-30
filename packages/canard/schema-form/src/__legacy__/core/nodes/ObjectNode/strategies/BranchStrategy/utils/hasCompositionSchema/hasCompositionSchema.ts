import type { SchemaNode } from '@/schema-form/core/types';

export const hasCompositionSchema = (node: SchemaNode) =>
  node.type === 'object' &&
  (node.jsonSchema.oneOf !== undefined || node.jsonSchema.anyOf !== undefined);
