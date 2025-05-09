/**
 * 값이 심볼인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 심볼이면 true, 아니면 false
 */
export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';
