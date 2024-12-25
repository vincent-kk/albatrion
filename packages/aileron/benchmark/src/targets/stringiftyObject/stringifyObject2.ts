export function stringifyObject(object: any): string {
  if (!object || typeof object !== 'object') return String(object);

  const stack: Array<{ obj: any; prefix: string }> = [
    { obj: object, prefix: '' },
  ];
  const parts: string[] = [];

  while (stack.length > 0) {
    const { obj, prefix } = stack.pop()!;

    // 현재 객체의 키를 정렬하여 처리
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        // 객체면 스택에 추가
        stack.push({ obj: value, prefix: fullKey });
      } else {
        // 값이면 해시 문자열에 추가
        parts.push(`${fullKey}:${String(value)}`);
      }
    }
  }

  return parts.join('|');
}
