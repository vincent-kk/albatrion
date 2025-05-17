import { isReactComponent } from '@winglet/react-utils';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * 스키마를 기반으로 Node 그룹을 반환합니다.
 * @param schema - JSON 스키마
 * @returns 노드 그룹: `branch` | `terminal`
 */
export const getNodeGroup = (schema: JsonSchemaWithVirtual) => {
  if (
    schema.type === 'boolean' ||
    schema.type === 'number' ||
    schema.type === 'integer' ||
    schema.type === 'string' ||
    schema.type === 'null' ||
    schema.terminal === true ||
    isTerminalFormTypeInput(schema)
  )
    return 'terminal';
  return 'branch';
};

const isTerminalFormTypeInput = (schema: JsonSchemaWithVirtual) =>
  'FormType' in schema &&
  isReactComponent(schema.FormType) &&
  schema.terminal !== false;
