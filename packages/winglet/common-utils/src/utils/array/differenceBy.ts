/**
 * 두 배열을 비교하여 첫 번째 배열에는 있지만 두 번째 배열에는 없는 요소를 반환하는 함수
 * 변환 함수를 사용하여 비교 기준을 정의할 수 있음
 * @template Type1 - 첫 번째 배열 요소의 타입
 * @template Type2 - 두 번째 배열 요소의 타입
 * @param source - 기준이 되는 원본 배열
 * @param exclude - 제외할 요소가 있는 배열
 * @param mapper - 배열 요소를 비교 가능한 값으로 변환하는 함수
 * @returns 첫 번째 배열에만 존재하는 요소들의 배열
 */
import { map } from './map';

export const differenceBy = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const excludeSet = new Set(map(exclude, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const mappedItem = mapper(item);
    if (!excludeSet.has(mappedItem)) result.push(item);
  }
  return result;
};
