import { JSONPointer } from '@winglet/json';

export const $DEFS = '$defs';
export const DEFINITIONS = 'definitions';

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

  for (let index = 0; index < length - 1; index++) {
    const segment = segments[index];
    if (segment !== $DEFS && segment !== DEFINITIONS) continue;
    if (index === length - 1) return false; // 1. If last is $defs itself → not a definition
    if (segments[index + 1] === '') return false; // 2. If next segment is empty string → no definition key
    if (index > 0 && segments[index - 1] === 'properties') return false; // 3. If immediately preceded by properties → not a definition
    return true;
  }

  return false;
};
