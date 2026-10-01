import { isArray } from '@winglet/common-utils/filter';
import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import { INVALID_VIRTUAL_NODE_VALUES } from '../errors/settleErrorCode';

/**
 * Reject a caller's invalid virtual tuple before any settlement state changes.
 * @param node - Virtual target with its ordered reference fields
 * @param input - Original caller value
 * @returns Nothing when the caller supplied a valid virtual shape
 */
export const assertVirtualWriteShape = <Self extends SchemaNodeRecord<Self>>(
  node: Self, input: unknown,
): void => {
  const fields = node.blueprintNode.fields ?? [];
  if (input !== undefined && (!isArray(input) || input.length !== fields.length))
    throw new SchemaFormError(INVALID_VIRTUAL_NODE_VALUES,
      `Invalid virtual node values at ${node.path}`,
      { path: node.path, expected: fields.length, received: input });
};
