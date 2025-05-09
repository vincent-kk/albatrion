/**
 * 입력값을 부울린 형식으로 분석합니다.
 * @param value - 분석할 값
 * @returns 분석된 부울린 값 또는 값이 undefined인 경우 undefined
 */
export const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') return true;
    if (normalizedValue === 'false') return false;
  }
  return !!value;
};
