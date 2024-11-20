export const parseNumber = (
  value: unknown,
  isInteger: boolean,
): number | undefined => {
  // 숫자 처리
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : isInteger ? Math.floor(value) : value;
  }
  // 문자열 처리
  if (typeof value === 'string') {
    const parsed = isInteger
      ? parseInt(value.replace(/[^\d-]/g, ''), 10)
      : parseFloat(value.replace(/[^\d-.]/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};
