/**
 * 객체를 완전히 펼친 경로와 정렬된 키를 사용하여 직렬화합니다.
 * 중첩된 객체의 모든 경로를 평면화하고 정렬하여 문자열로 변환합니다.
 *
 * @param object - 직렬화할 객체
 * @returns 직렬화된 문자열 ('fullpath:value' 형태로 '|'로 구분)
 *
 * @example
 * serializeWithFullSortedKeys({a: 1, b: {c: 2}}); // 'a:1|b.c:2'
 * serializeWithFullSortedKeys({c: 3, a: 1, b: 2}); // 'a:1|b:2|c:3'
 */
export const serializeWithFullSortedKeys = (object: any): string => {
  if (!object || typeof object !== 'object') return String(object);
  const stack: Array<{ obj: any; prefix: string }> = [
    { obj: object, prefix: '' },
  ];
  const parts: string[] = [];
  while (stack.length > 0) {
    const { obj, prefix } = stack.pop()!;
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object')
        stack[stack.length] = { obj: value, prefix: fullKey };
      else parts[parts.length] = `${fullKey}:${String(value)}`;
    }
  }
  return parts.join('|');
};
