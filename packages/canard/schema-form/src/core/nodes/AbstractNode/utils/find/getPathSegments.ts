import { JSONPath, isTruthy } from '@winglet/common-utils';

const ARRAY_PATTERN = /\[(\d+)\]/g;

/**
 * 경로 문자열을 세그먼트 배열로 분할합니다.
 * 배열 표기법([0])을 점 표기법(.0)으로 변환합니다.
 * @param path - 분할할 경로 문자열 (ex. 'root.child[0].property')
 * @returns 분할된 경로 세그먼트 배열 (ex. ['root', 'child', '0', 'property'])
 */
export const getPathSegments = (path: string) =>
  path
    .replace(ARRAY_PATTERN, `${JSONPath.Child}$1`)
    .split(JSONPath.Child)
    .filter(isTruthy);
