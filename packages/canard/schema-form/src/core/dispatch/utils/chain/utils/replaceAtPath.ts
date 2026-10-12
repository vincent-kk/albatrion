import { isArray } from '@winglet/common-utils/filter';

import { SetValueOption } from '../../../../types/value';

/** Select replacement or a shallow object merge for one marked target. */
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
export const replaceAtPath = (current: unknown, names: readonly string[],
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
