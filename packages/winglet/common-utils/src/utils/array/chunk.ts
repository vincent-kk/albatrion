import { isInteger } from '@/common-utils/utils/filter/isInteger';

/**
 * 배열을 지정된 크기의 청크(덮음)로 분할하는 함수
 * @template Type - 배열 요소의 타입
 * @param array - 분할할 배열
 * @param size - 각 청크의 크기
 * @returns 분할된 청크들의 배열
 */
export const chunk = <Type>(array: Type[], size: number): Type[][] => {
  if (!isInteger(size) || size < 1) return [array];
  const chunkSize = Math.ceil(array.length / size);
  const result: Type[][] = new Array(chunkSize);
  for (let index = 0; index < chunkSize; index++) {
    const start = index * size;
    const end = start + size;
    result[index] = array.slice(start, end);
  }
  return result;
};
