/**
 * 문자열이 유효한 배열 인덱스를 나타내는지 확인하는 함수
 * 문자열이 숫자로만 구성되어 있는지 확인
 * @param value - 확인할 문자열
 * @returns 문자열이 유효한 배열 인덱스면 true, 아니면 false
 */
export const isArrayIndex = (value: string): boolean => {
  if (!value) return false;
  let character;
  let index = 0;
  const length = value.length;
  while (index < length) {
    character = value.charCodeAt(index);
    if (character < 48 || character > 57) return false;
    index++;
  }
  return true;
};
