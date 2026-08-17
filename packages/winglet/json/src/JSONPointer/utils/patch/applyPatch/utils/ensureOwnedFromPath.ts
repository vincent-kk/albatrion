import { isArray } from '@winglet/common-utils/filter';

import { JSONPointer } from '@/json/JSONPointer/enum';
import { unescapePath } from '@/json/JSONPointer/utils/escape/unescapePath';
import type { JsonRoot } from '@/json/type';

import { getArrayIndex } from './getArrayIndex';

/**
 * Shallowly clones every existing intermediate node on a MOVE source path.
 *
 * MOVE handlers remove the source with a direct pointer mutation that bypasses the target
 * path walk. Owning each source-path parent keeps that deletion inside the immutable result.
 * Missing or non-object intermediate values stop ownership acquisition so the existing
 * MOVE resolution remains responsible for its established outcome.
 *
 * @param source - Root document receiving the MOVE operation
 * @param from - JSON Pointer identifying the value to move
 * @param cloned - Object references already owned by the immutable result
 */
export const ensureOwnedFromPath = (
  source: JsonRoot,
  from: string,
  cloned: WeakSet<object>,
): void => {
  const segments = from.split('/');
  if (segments[0] !== '' && segments[0] !== JSONPointer.Fragment) return;

  let current: any = source;
  for (let cursor = 1, l = segments.length - 1; cursor < l; cursor++) {
    let segment: string | number = unescapePath(segments[cursor]);
    if (isArray(current)) segment = getArrayIndex(segment, current);

    let next: any = current[segment];
    if (next === null || typeof next !== 'object') return;
    if (!cloned.has(next)) {
      next = isArray(next) ? next.slice() : { ...next };
      cloned.add(next);
      current[segment] = next;
    }
    current = next;
  }
};
