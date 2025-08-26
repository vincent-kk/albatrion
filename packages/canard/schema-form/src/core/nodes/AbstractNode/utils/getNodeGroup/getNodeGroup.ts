import { isReactComponent } from '@winglet/react-utils/filter';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Returns the node group based on the schema.
 * @param schema - JSON schema
 * @returns Node group: `branch` | `terminal` | `virtual`
 */
export const getNodeGroup = (
  schema: JsonSchemaWithVirtual,
): 'branch' | 'terminal' | 'virtual' => {
  if (schema.type === 'virtual') return 'virtual';
  if (typeof schema.terminal === 'boolean')
    return schema.terminal ? 'terminal' : 'branch';
  if (schema.type === 'array' || schema.type === 'object')
    return isTerminalFormTypeInput(schema) ? 'terminal' : 'branch';
  return 'terminal';
};

const isTerminalFormTypeInput = (schema: JsonSchemaWithVirtual) =>
  'FormTypeInput' in schema && isReactComponent(schema.FormTypeInput);
