import { isArray, isPlainObject } from '@winglet/common-utils';
import { JSONPath } from '@winglet/json';

/**
 * 중첩된 데이터 구조에서 JSON 경로 목록을 추출합니다.
 * @param data - 검색할 데이터 구조
 * @param initialPath - 초기 경로 (기본값: '')
 * @returns JSON 경로 목록
 */
export const getJsonPaths = (data: any, initialPath = ''): string[] => {
  const result: string[] = [];
  const stack: Array<{ data: any; path: string }> = [
    { data, path: initialPath },
  ];
  while (stack.length > 0) {
    const { data, path } = stack.pop()!;
    if (path) result.push(path);
    if (isArray(data)) {
      for (let i = data.length - 1; i >= 0; i--)
        stack.push({
          data: data[i],
          path: `${path}[${i}]`,
        });
    } else if (isPlainObject(data)) {
      const entries = Object.entries(data);
      for (let i = entries.length - 1; i >= 0; i--) {
        const [key, value] = entries[i];
        stack.push({
          data: value,
          path: path
            ? `${path}${JSONPath.Child}${key}`
            : `${JSONPath.Child}${key}`,
        });
      }
    }
  }
  return result;
};
