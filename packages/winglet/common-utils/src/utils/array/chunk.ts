import { isInteger } from '@/common-utils/utils/filter/isInteger';

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
