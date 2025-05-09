/**
 * 입력값을 문자열 형식으로 분석합니다.
 * @param value - 분석할 값
 * @returns 분석된 문자열 값 또는 빈 문자열이거나 유효하지 않은 경우 undefined
 */
export const parseString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.length > 0 ? value : undefined;
  if (typeof value === 'number') return value.toString();
  return undefined;
};
