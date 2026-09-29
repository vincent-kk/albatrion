import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { writeSchemaNode } from '../write/writeSchemaNode';
import { setLoadValue } from './setLoadValue';

/**
 * Start a form's first load lifetime with a retained source snapshot.
 * @param root - Live root of the analyzed form
 * @param value - Immutable mount input
 * @param option - Mount's automatic-write selection
 * @returns Nothing; one settle call commits the loaded tree
 */
export const loadSchemaNodeAtMount = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown, option: SetValueOption,
): void => {
  root.runtime.loadSnapshot = setLoadValue(root.runtime.loadSnapshot, '', value);
  root.runtime.diagnostics = { status: 'stable' };
  writeSchemaNode(root, value, 'load', option);
};
