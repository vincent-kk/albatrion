import { isReactComponent } from '@winglet/react-utils/filter';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Returns the node group based on the schema.
 * @param schema - JSON schema
 * @returns Node group: `branch` | `terminal`
 */
export const getNodeGroup = (schema: JsonSchemaWithVirtual) => {
  if (
    schema.type === 'boolean' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'string' ||
    schema.type === 'null' ||
    schema.terminal === true ||
    isTerminalFormTypeInput(schema) ||
    isTerminalFormType(schema)
  )
    return 'terminal';
  return 'branch';
};

const isTerminalFormTypeInput = (schema: JsonSchemaWithVirtual) =>
  'FormTypeInput' in schema &&
  isReactComponent(schema.FormTypeInput) &&
  schema.terminal !== false;

/** @deprecated Use isTerminalFormTypeInput instead, this function will be removed in v0.4.0 */
const isTerminalFormType = (schema: JsonSchemaWithVirtual) =>
  'FormType' in schema &&
  isReactComponent(schema.FormType) &&
  schema.terminal !== false;
