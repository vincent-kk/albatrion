import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Select a new occurrence's authored default by reserved-layer priority.
 * @param node - Occurrence with its final active effective schema
 * @returns The authored value or undefined when no layer supplies one
 */
export const readDefault = <Self extends SchemaNodeRecord<Self>>(node: Self): unknown => {
  const schema = node.schema.schema;
  if (schema === null || typeof schema !== 'object') return undefined;
  const controls = schema.controls;
  if (controls !== null && typeof controls === 'object' &&
    hasOwnProperty(controls, 'default')) return Reflect.get(controls, 'default');
  return hasOwnProperty(schema, 'default') ? schema.default : undefined;
};
