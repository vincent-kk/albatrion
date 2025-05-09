/**
 * 정규식 패턴이 유효한지 확인하는 함수
 * @param pattern - 확인할 정규식 패턴
 * @returns 정규식 패턴이 유효하면 true, 아니면 false
 */
export const isValidRegexPattern = (pattern: string): pattern is string => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};
