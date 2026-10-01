import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import { SetValueOption } from '../../../types/value';

/**
 * Apply a merge flag to one marked target without settling computed rules.
 * @param previous - Committed or previously marked input
 * @param incoming - New input resolved at its call site
 * @param option - Caller flags controlling replacement
 * @returns Value to overlay at this target
 */
const markedValue = (previous: unknown, incoming: unknown,
  option: SetValueOption): unknown =>
  (option & SetValueOption.Merge) === SetValueOption.Merge &&
  !(option & SetValueOption.Replace) && previous !== null &&
  incoming !== null && typeof previous === 'object' &&
  typeof incoming === 'object' && !isArray(previous) && !isArray(incoming)
    ? { ...previous, ...incoming } : incoming;

/**
 * Replace one marked path while retaining untouched committed references.
 * @param current - Candidate value at this level
 * @param names - Remaining unescaped child names
 * @param incoming - New value for the target
 * @param option - Merge or replacement selection
 * @returns Candidate value with one path overlaid
 */
const replaceAtPath = (current: unknown, names: readonly string[],
  incoming: unknown, option: SetValueOption): unknown => {
  if (!names.length) return markedValue(current, incoming, option);
  const [name, ...rest] = names;
  if (isArray(current)) {
    const next = [...current];
    next[Number(name)] = replaceAtPath(next[Number(name)], rest, incoming, option);
    return next;
  }
  const next = current !== null && typeof current === 'object' ? { ...current } : {};
  return { ...next, [name]: replaceAtPath(Reflect.get(next, name), rest, incoming, option) };
};

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
