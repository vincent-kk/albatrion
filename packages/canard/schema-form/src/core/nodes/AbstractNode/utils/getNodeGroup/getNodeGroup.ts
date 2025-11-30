import { hasOwnProperty } from '@winglet/common-utils/lib';
import { isReactComponent } from '@winglet/react-utils/filter';

import { isBranchType } from '@/schema-form/helpers/jsonSchema';
import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

/**
 * Returns the node group based on the schema type.
 * @param type - JSON schema type
 * @param schema - JSON schema
 * @returns Node group: `branch` | `terminal`
 */
export const getNodeGroup = (
  type: JsonSchemaType,
  schema: JsonSchemaWithVirtual,
): 'branch' | 'terminal' => {
  if (typeof schema.terminal === 'boolean')
    return schema.terminal ? 'terminal' : 'branch';
  if (isBranchType(type))
    return isTerminalFormTypeInput(schema) ? 'terminal' : 'branch';
  return 'terminal';
};

const isTerminalFormTypeInput = (schema: JsonSchemaWithVirtual) =>
  hasOwnProperty(schema, 'FormTypeInput') &&
  isReactComponent(schema.FormTypeInput);
