import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { replaceAtPath } from './utils/replaceAtPath';

/**
 * Overlay marked caller inputs onto the last committed root value.
 * @param root - Common root of every marked occurrence
 * @param writes - Call-order inputs, already resolved from updaters
 * @returns Candidate root input for one settlement
 */
export const composeBatchValue = <Self extends SchemaNodeRecord<Self>>(
  root: Self, writes: readonly { node: Self; value: unknown; option: SetValueOption }[],
): unknown => {
  let value = root.local;
  for (const write of writes) {
    const names = write.node.path ? write.node.path.slice(1).split('/')
      .map((name) => name.replace(/~1/g, '/').replace(/~0/g, '~')) : [];
    value = replaceAtPath(value, names, write.value, write.option);
  }
  return value;
};
