import { JSONPointer } from '@winglet/json/pointer';

import { $DEFS, DEFINITIONS } from '../type';

export const isDefinitionSchema = (path: string): boolean => {
  if (
    path.length <= 2 ||
    (path[0] !== JSONPointer.Separator &&
      (path[0] !== JSONPointer.Fragment || path[1] !== JSONPointer.Separator))
  )
    return false;

  const segments: string[] = [];
  let start = path[0] === '/' ? 1 : 2;
  let cursor = start;
  let isFinal = false;

  while (cursor <= path.length) {
    let end = cursor;
    while (end < path.length && path[end] !== '/') end++;
    if (end > cursor) {
      const segment = path.slice(start, end);
      segments.push(segment);
      if (isFinal) break;
      isFinal = segment === $DEFS || segment === DEFINITIONS;
    }
    start = end + 1;
    cursor = start;
  }

  const length = segments.length;
  if (length < 2) return false;

  for (let i = 0, l = length - 1; i < l; i++) {
    const segment = segments[i];
    if (segment !== $DEFS && segment !== DEFINITIONS) continue;
    if (i === length - 1) return false; // 1. If last is $defs itself → not a definition
    if (segments[i + 1] === '') return false; // 2. If next segment is empty string → no definition key
    if (i > 0 && segments[i - 1] === 'properties') return false; // 3. If immediately preceded by properties → not a definition
    return true;
  }

  return false;
};
