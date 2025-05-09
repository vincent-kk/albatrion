/**
 * 입력값을 숫자 형식으로 분석합니다.
 * @param value - 분석할 값
 * @param isInteger - 정수 반환 여부
 * @returns 분석된 숫자 값 또는 분석이 불가능할 경우 undefined
 */
export const parseNumber = (
  value: unknown,
  isInteger: boolean,
): number | undefined => {
  if (typeof value === 'number')
    return isNaN(value) ? undefined : isInteger ? ~~value : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d-.]/g, ''));
    return isNaN(parsed) ? undefined : isInteger ? ~~parsed : parsed;
  }
  return undefined;
};
