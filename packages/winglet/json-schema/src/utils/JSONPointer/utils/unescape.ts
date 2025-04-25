import { TILDE } from '../enum';

/**
 * JSON Pointer 이스케이프 문자를 원래 문자로 변환합니다.
 * 최적화: 이스케이프된 문자가 있는 경우에만 변환 작업을 수행합니다.
 */
export const unescape = (str: string, start: number, end: number): string => {
  const len = end - start;
  const chars: string[] = new Array(len);
  let writeIndex = 0;
  for (let i = start; i < end; i++) {
    const char = str[i];
    if (char === TILDE) {
      const nextChar = str[i + 1];
      if (nextChar === '1') {
        chars[writeIndex++] = '/';
        i++;
      } else if (nextChar === '0') {
        chars[writeIndex++] = TILDE;
        i++;
      } else {
        chars[writeIndex++] = char;
      }
    } else {
      chars[writeIndex++] = char;
    }
  }
  return chars.slice(0, writeIndex).join('');
};
