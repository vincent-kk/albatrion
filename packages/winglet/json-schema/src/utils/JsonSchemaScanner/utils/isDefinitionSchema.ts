export const $DEFS = '$defs';
export const DEFINITIONS = 'definitions';

export const isDefinitionSchema = (path: string): boolean => {
  if (
    path.length <= 2 ||
    (path[0] !== '/' && (path[0] !== '#' || path[1] !== '/'))
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
    if (index === length - 1) return false; // 1. 마지막이 $defs 자체 → 정의 아님
    if (segments[index + 1] === '') return false; // 2. 다음 세그먼트가 빈 문자열이면 → 정의 키 없음
    if (index > 0 && segments[index - 1] === 'properties') return false; // 3. 바로 앞이 properties이면 → 정의 아님
    return true;
  }

  return false;
};
