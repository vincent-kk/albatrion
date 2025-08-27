import { isReactComponent } from '@winglet/react-utils/filter';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Returns the node group based on the schema.
 * @param schema - JSON schema
 * @returns Node group: `branch` | `terminal`
 */
export const getNodeGroup = (
  schema: JsonSchemaWithVirtual,
): 'branch' | 'terminal' => {
  if (typeof schema.terminal === 'boolean')
    return schema.terminal ? 'terminal' : 'branch';
  if (
    schema.type === 'array' ||
    schema.type === 'object' ||
    schema.type === 'virtual'
  )
    return isTerminalFormTypeInput(schema) ? 'terminal' : 'branch';
  return 'terminal';
};

const isTerminalFormTypeInput = (schema: JsonSchemaWithVirtual) =>
  'FormTypeInput' in schema && isReactComponent(schema.FormTypeInput);
