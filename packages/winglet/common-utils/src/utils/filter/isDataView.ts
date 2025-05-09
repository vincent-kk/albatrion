/**
 * 값이 DataView 인지 확인하는 함수
 * @param value - 확인할 값
 * @returns 값이 DataView이면 true, 아니면 false
 */
export const isDataView = (value: unknown): value is DataView =>
  value instanceof DataView;
