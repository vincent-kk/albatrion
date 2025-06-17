export const normalizeWhitespace = (string: string): string => {
  if (!string) return '';
  let result = '';
  let prevWasSpace = true;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    if (char === 32 || char === 9 || char === 10 || char === 13) {
      if (!prevWasSpace) {
        result += ' '; // 공백은 단일 스페이스(32)로 통일
        prevWasSpace = true;
      }
    } else {
      result += string[i];
      prevWasSpace = false;
    }
  }
  if (result.length > 0 && result.charCodeAt(result.length - 1) === 32)
    result = result.slice(0, -1);
  return result;
};
